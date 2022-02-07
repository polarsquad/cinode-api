import got from 'got';
import { cinode } from '../config';
import jwt_decode from 'jwt-decode';
import moment from 'moment';
import Bottleneck from 'bottleneck';

// See our limits:
// https://app.cinode.com/COMPANYNAME/administration/integrations/api
const MAX_REQUESTS_TIME = 2000;
const MAX_REQUESTS_IN_TIME = 35; // Actually 40, but we hit the limit sometimes

const limiter = new Bottleneck({
  reservoir: MAX_REQUESTS_IN_TIME, // initial value
  reservoirRefreshAmount: MAX_REQUESTS_IN_TIME,
  reservoirRefreshInterval: MAX_REQUESTS_TIME,
});

function isValidJwtToken(token) {
  try {
    // not a fan of casting to `any`, but it works, seems like an issue with the third-party library
    return moment.unix((jwt_decode(token) as any).exp).isAfter();
  } catch (e) {
    return false;
  }
}

export const client = got.extend({
  prefixUrl: 'https://api.cinode.com',
  hooks: {
    beforeRequest: [
      // @ts-expect-error: TODO: fix this
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      limiter.wrap(() => {}),
      async (options) => {
        if (!options.context) options.context = {};

        if (!options.context.access_token) {
          try {
            const { access_token, refresh_token } = await got
              .get('token', {
                prefixUrl: options.prefixUrl,
                username: cinode.appId,
                password: cinode.appSecret,
                hooks: {
                  // beforeRequest: [console.log],
                  beforeRedirect: [console.log],
                },
              })
              .json();
            options.context.access_token = access_token;
            options.context.refresh_token = refresh_token;
            console.log('Authenticated to the Cinode API');
          } catch (e) {
            console.log('token fail', e);
          }
        }

        if (
          !isValidJwtToken(options.context.access_token) &&
          options.context.refresh_token
        ) {
          const { access_token, refresh_token } = await got
            .post('token/refresh', {
              prefixUrl: options.prefixUrl,
              json: { refreshToken: options.context.refresh_token },
            })
            .json();

          options.context.access_token = access_token;
          options.context.refresh_token = refresh_token;
          console.log('Refreshed Cinode API access token');
        }

        options.headers[
          'Authorization'
        ] = `Bearer ${options.context.access_token}`;
      },
    ],
  },
  context: {},
});
