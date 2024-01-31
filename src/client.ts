import Bottleneck from 'bottleneck';
import got, {
  BeforeErrorHook,
  HandlerFunction,
  HTTPError,
  Options,
  RequestError,
} from 'got';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import moment from 'moment';

const CINODE_API_URL = 'https://api.cinode.app';

// See your limits: https://app.cinode.com/COMPANYNAME/administration/integrations/api
const MAX_REQUESTS_TIME_WINDOW_MS = 2000;
const MAX_REQUESTS_IN_WINDOW = 35; // Actually 40, but we hit the limit sometimes
// Additional limits based on experience with the Cinode API
const MAX_CONCURRENT = 20; // Cinode API is quite aggressive with rate-limiting
const MIN_WAIT_QUEUED_REQ_MS = 200; // How long to wait before launching a queued request

const limiter = new Bottleneck({
  maxConcurrent: MAX_CONCURRENT,
  minTime: MIN_WAIT_QUEUED_REQ_MS,
  reservoir: MAX_REQUESTS_IN_WINDOW, // initial value
  reservoirRefreshAmount: MAX_REQUESTS_IN_WINDOW,
  reservoirRefreshInterval: MAX_REQUESTS_TIME_WINDOW_MS,
});

function isValidJwtToken(token: string): boolean {
  try {
    return moment.unix(jwtDecode<JwtPayload>(token).exp || 0).isAfter();
  } catch (e) {
    return false;
  }
}

const stackTraceHandler: HandlerFunction = (options, next) => {
  const context: { stack?: string } = {};
  Error.captureStackTrace(context, stackTraceHandler);
  options.context = { ...options.context, stack: context.stack };
  return next(options);
};

/**
 * Provide a slightly more useful error message with the:
 * - response status
 * - request method
 * - request URL
 */
const formatErrorMessage: BeforeErrorHook = (error: RequestError) => {
  if (error instanceof HTTPError) {
    const { statusCode } = error.response;
    const { method, url } = error.options;

    error.message = `${statusCode} ${method} ${url}`;
  }

  return error;
};

/**
 * Include the full async stack trace in error traces, instead of only what
 * happened inside "got".
 */
const addSourceStackTraceToError: BeforeErrorHook = (error: RequestError) => {
  error.stack = `${error.stack}\n---Source Stack---\n${error.options.context['stack']}`;
  return error;
};

export default (apiToken: string) =>
  got.extend({
    prefixUrl: CINODE_API_URL,
    handlers: [stackTraceHandler],
    hooks: {
      beforeError: [formatErrorMessage, addSourceStackTraceToError],
      beforeRequest: [
        limiter.wrap(async (options: Options) => {
          if (!isValidJwtToken(apiToken)) {
            throw new Error('Cinode API token is expired!');
          }

          options.headers['Authorization'] = `Bearer ${apiToken}`;
        }),
      ],
    },
    retry: {
      limit: 10,
      maxRetryAfter: 10 * 60 * 1000, // 10 min (NOTE: it's actually in milliseconds, even if the docs reference Retry-After which is in seconds)
    },
  });
