import morgan from 'morgan';
import { logStream } from '../config/logger';

// Define custom Morgan tokens
morgan.token('body', (req: any) => {
  // Don't log sensitive data like passwords
  if (req.body) {
    const sanitizedBody = { ...req.body };
    // Remove sensitive fields
    delete sanitizedBody.password;
    delete sanitizedBody.token;
    delete sanitizedBody.secret;
    return JSON.stringify(sanitizedBody);
  }
  return '-';
});

morgan.token('error-message', (req: any) => {
  return req.error ? req.error.message : '-';
});

// Define different formats for development and production

// Development format - detailed and colorful
export const devLogger = morgan(
  ':method :url :status :response-time ms - :res[content-length] :body',
  {
    stream: logStream,
  }
);

// Production format - JSON structured for parsing
export const prodLogger = morgan(
  (tokens, req, res) => {
    return JSON.stringify({
      method: tokens.method(req, res),
      url: tokens.url(req, res),
      status: tokens.status(req, res),
      responseTime: tokens['response-time'](req, res),
      contentLength: tokens.res(req, res, 'content-length'),
      userAgent: tokens['user-agent'](req, res),
      remoteAddr: tokens['remote-addr'](req, res),
      body: tokens.body(req, res),
    });
  },
  {
    stream: logStream,
  }
);

// Skip logging for health check in production
export const skipHealthCheck = (req: any, res: any) => {
  return req.url === '/health' && process.env.NODE_ENV === 'production';
};

// Choose the appropriate logger based on environment
const requestLogger =
  process.env.NODE_ENV === 'production'
    ? morgan(
        (tokens, req, res) => {
          return JSON.stringify({
            method: tokens.method(req, res),
            url: tokens.url(req, res),
            status: tokens.status(req, res),
            responseTime: tokens['response-time'](req, res),
            contentLength: tokens.res(req, res, 'content-length'),
            userAgent: tokens['user-agent'](req, res),
            remoteAddr: tokens['remote-addr'](req, res),
          });
        },
        {
          stream: logStream,
          skip: skipHealthCheck,
        }
      )
    : morgan(':method :url :status :response-time ms - :res[content-length]', {
        stream: logStream,
      });

export default requestLogger;
