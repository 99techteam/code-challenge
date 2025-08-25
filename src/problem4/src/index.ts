import cors from 'cors';
import path from 'path';
import { HttpStatusCode } from 'axios';
import express, { Application, NextFunction, Request, Response } from 'express';
import { createServer, Server as HttpServer } from 'http';
import { AddressInfo } from 'net';
import databaseLoader from './databases';
import { corsOptions, env, header } from '@shared/configs';
import formatResponse from '@shared/loaders/response.loader';
import ErrorHandler from '@shared/exceptions/error.exception';
import routes from '@shared/routes';
import cookieParser from 'cookie-parser';

class Server {
  public app: Application;
  protected server: HttpServer;

  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    this.config();
  }

  private config(): void {
    const port = env.app.port;
    const { errorHandler } = this.getMiddlewareFunctions();

    this.app.set('port', port);
    this.app.use(cors(corsOptions));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(express.static(path.join(process.cwd(), 'public')));

    // cookie
    this.app.use(cookieParser());

    // header
    header(this.app);

    // Setting up routes
    routes(this.app);

    // Applying middleware and error handling
    this.app.use(errorHandler);

    // Format response middleware
    this.app.use(formatResponse);

    // Handling not found routes
    this.app.all(/.*/, (req: Request, res: Response) => {
      return res.status(HttpStatusCode.NotFound).json({
        message: 'Page not found!',
      });
    });
  }

  private getMiddlewareFunctions() {
    const errorHandler = (
      err: Error,
      req: Request,
      res: Response,
      next: NextFunction
    ) => {
      ErrorHandler.handle(err, req, res, next);
    };

    return {
      errorHandler,
    };
  }

  public async start(): Promise<void> {
    try {
      this.server.listen(this.app.get('port'), async () => {
        const { port } = this.server.address() as AddressInfo;
        await databaseLoader.connectToDatabase();
      });
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  }
}

const server = new Server();
server.start();
