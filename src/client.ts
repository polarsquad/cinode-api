import Bottleneck from 'bottleneck';
import got, { Options } from 'got';
import _jwt_decode, { JwtPayload } from 'jwt-decode';
// TODO: Drop workaround when upstream in jwt-decode, context: https://github.com/microsoft/TypeScript/issues/50690#issuecomment-1241464619
const jwt_decode = _jwt_decode as unknown as typeof _jwt_decode.default;

import moment from 'moment';

const CINODE_API_URL = 'https://api.cinode.app';

// See your limits:
// https://app.cinode.app/COMPANYNAME/administration/integrations/api
const MAX_REQUESTS_TIME = 2000;
const MAX_REQUESTS_IN_TIME = 35; // Actually 40, but we hit the limit sometimes

const limiter = new Bottleneck({
  reservoir: MAX_REQUESTS_IN_TIME, // initial value
  reservoirRefreshAmount: MAX_REQUESTS_IN_TIME,
  reservoirRefreshInterval: MAX_REQUESTS_TIME,
});

function isValidJwtToken(token: string): boolean {
  try {
    return moment.unix(jwt_decode<JwtPayload>(token).exp || 0).isAfter();
  } catch (e) {
    return false;
  }
}

export default (apiToken: string) =>
  got.extend({
    prefixUrl: CINODE_API_URL,
    hooks: {
      beforeRequest: [
        limiter.wrap(async (options: Options) => {
          if (!isValidJwtToken(apiToken)) {
            throw new Error('Cinode API token is expired!');
          }

          options.headers['Authorization'] = `Bearer ${apiToken}`;
        }),
      ],
    },
  });
