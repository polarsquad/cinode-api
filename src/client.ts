import got from 'got';
import jwt_decode from 'jwt-decode';
import moment from 'moment';
import Bottleneck from 'bottleneck';

const CINODE_API_URL = 'https://api.cinode.com';

// Persist session between the requests
const session: {
  access_token?: string;
  refresh_token?: string;
} = {};

// See your limits:
// https://app.cinode.com/COMPANYNAME/administration/integrations/api
const MAX_REQUESTS_TIME = 2000;
const MAX_REQUESTS_IN_TIME = 35; // Actually 40, but we hit the limit sometimes

const limiter = new Bottleneck({
  reservoir: MAX_REQUESTS_IN_TIME, // initial value
  reservoirRefreshAmount: MAX_REQUESTS_IN_TIME,
  reservoirRefreshInterval: MAX_REQUESTS_TIME,
});

function isValidJwtToken(token: string): boolean {
  try {
    // not a fan of casting to `any`, but it works, seems like an issue with the third-party library
    return moment.unix((jwt_decode(token) as any).exp).isAfter();
  } catch (e) {
    return false;
  }
}

export default (accessId: string, accessSecret: string) =>
  got.extend({
    prefixUrl: CINODE_API_URL,
    hooks: {
      beforeRequest: [
        // @ts-expect-error: TODO: fix this
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        limiter.wrap(() => {}),
        async (options) => {
          if (!session.access_token) {
            try {
              const { access_token, refresh_token } = await got
                .get('token', {
                  prefixUrl: CINODE_API_URL,
                  username: accessId,
                  password: accessSecret,
                  hooks: {
                    // beforeRequest: [console.log],
                    beforeRedirect: [console.log],
                  },
                })
                .json();
              session.access_token = access_token;
              session.refresh_token = refresh_token;
              console.log('Authenticated to the Cinode API');
            } catch (e) {
              console.log('token fail', e);
              throw e;
            }
          }

          if (!isValidJwtToken(session.access_token) && session.refresh_token) {
            const { access_token, refresh_token } = await got
              .post('token/refresh', {
                prefixUrl: options.prefixUrl,
                json: { refreshToken: session.refresh_token },
              })
              .json();

            session.access_token = access_token;
            session.refresh_token = refresh_token;
            console.log('Refreshed Cinode API access token');
          }

          options.headers['Authorization'] = `Bearer ${session.access_token}`;
        },
      ],
    },
  });
