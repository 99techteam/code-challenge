import { Request, Response, NextFunction } from 'express';
import { requestLogger } from '../src/middlewares/requestLogger';
import logger from '../src/lib/logger';

jest.mock('../src/lib/logger');

describe('Request Logger Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      method: 'GET',
      url: '/api/items',
      get: jest.fn().mockReturnValue('Mozilla/5.0'),
      ip: '192.168.1.1',
      connection: { remoteAddress: '192.168.1.1' } as any,
    };
    mockRes = {
      statusCode: 200,
      on: jest.fn(),
    };
    mockNext = jest.fn();

    jest.clearAllMocks();
  });

  it('should log successful requests with info level', (done) => {
    mockRes.statusCode = 200;
    
    (mockRes.on as jest.Mock).mockImplementation((event, callback) => {
      if (event === 'finish') {
        setTimeout(() => {
          callback();
          
          expect(logger.info).toHaveBeenCalledWith(
            expect.objectContaining({
              method: 'GET',
              url: '/api/items',
              statusCode: 200,
              duration: expect.stringMatching(/^\d+ms$/),
              userAgent: 'Mozilla/5.0',
              ip: '192.168.1.1',
            }),
            'HTTP Request'
          );
          done();
        }, 10);
      }
    });

    requestLogger(mockReq as Request, mockRes as Response, mockNext);
    expect(mockNext).toHaveBeenCalledWith();
  });

  it('should log client error requests with warn level', (done) => {
    mockRes.statusCode = 404;
    
    (mockRes.on as jest.Mock).mockImplementation((event, callback) => {
      if (event === 'finish') {
        setTimeout(() => {
          callback();
          
          expect(logger.warn).toHaveBeenCalledWith(
            expect.objectContaining({
              method: 'GET',
              url: '/api/items',
              statusCode: 404,
              duration: expect.stringMatching(/^\d+ms$/),
              userAgent: 'Mozilla/5.0',
              ip: '192.168.1.1',
            }),
            'HTTP Request'
          );
          done();
        }, 10);
      }
    });

    requestLogger(mockReq as Request, mockRes as Response, mockNext);
  });

  it('should log server error requests with warn level', (done) => {
    mockRes.statusCode = 500;
    
    (mockRes.on as jest.Mock).mockImplementation((event, callback) => {
      if (event === 'finish') {
        setTimeout(() => {
          callback();
          
          expect(logger.warn).toHaveBeenCalledWith(
            expect.objectContaining({
              method: 'GET',
              url: '/api/items',
              statusCode: 500,
              duration: expect.stringMatching(/^\d+ms$/),
            }),
            'HTTP Request'
          );
          done();
        }, 10);
      }
    });

    requestLogger(mockReq as Request, mockRes as Response, mockNext);
  });

  it('should handle missing request properties gracefully', (done) => {
    const mockReqMinimal: Partial<Request> = {
      method: 'POST',
      url: '/api/items',
      get: jest.fn().mockReturnValue(undefined),
      connection: {} as any,
    };

    (mockRes.on as jest.Mock).mockImplementation((event, callback) => {
      if (event === 'finish') {
        setTimeout(() => {
          callback();
          
          expect(logger.info).toHaveBeenCalledWith(
            expect.objectContaining({
              method: 'POST',
              url: '/api/items',
              statusCode: 200,
              userAgent: undefined,
              ip: undefined,
            }),
            'HTTP Request'
          );
          done();
        }, 10);
      }
    });

    requestLogger(mockReqMinimal as Request, mockRes as Response, mockNext);
  });

  it('should measure request duration accurately', (done) => {
    (mockRes.on as jest.Mock).mockImplementation((event, callback) => {
      if (event === 'finish') {
        setTimeout(() => {
          callback();
          
          const logCall = (logger.info as jest.Mock).mock.calls[0];
          const logData = logCall[0];
          const duration = parseInt(logData.duration.replace('ms', ''));
          
          expect(duration).toBeGreaterThanOrEqual(50);
          done();
        }, 60);
      }
    });

    requestLogger(mockReq as Request, mockRes as Response, mockNext);
  });

  it('should call next middleware immediately', () => {
    requestLogger(mockReq as Request, mockRes as Response, mockNext);
    expect(mockNext).toHaveBeenCalledWith();
    expect(mockNext).toHaveBeenCalledTimes(1);
  });
});