import { loadControllers, scopePerRequest } from 'awilix-express'
import { Router } from 'express';
import express from 'express';
import statusMonitor from 'express-status-monitor';
import cors from 'cors';
import bodyParser from 'body-parser';
import compression from 'compression';
import methodOverride from 'method-override';

class Server {

    private _logger: any;
    private _express: any;
    private _router: any;
    private _errorHandler: any;
    private _loggerMiddleware: any;

    constructor({ logger, loggerMiddleware, errorHandler }: any) {
        this._logger = logger;
        this._loggerMiddleware = loggerMiddleware;
        this._errorHandler = errorHandler;
        this._express = express();
        this._config();
    }

    register(container: any) {
        this._express.use(scopePerRequest(container))
    }

    controllers(path: string, basePath: string) {
        const routes = loadControllers(path, { cwd: basePath });
        this._express.use(routes);
    }

    start(port: Number) {
        this._express
            .listen(port, () => {
                this._logger.info(`[p ${process.pid}][${process.env.NODE_ENV}][${port}] Server is running`);
            })
    }

    express() {
        return this._express;
    }

    private _config() {
        this._express.disable('x-powered-by');

        this._router = Router()
            .use(methodOverride('X-HTTP-Method-Override'))
            .use(cors())
            .use(bodyParser.json())
            .use(bodyParser.urlencoded({ extended: true }))
            .use(compression())
            .use(this._loggerMiddleware)
            .use(this._errorHandler);

        if (process.env.NODE_ENV != 'production') {
            this._router.use(statusMonitor());
        }

        this._express.use(this._router);
    }
}

export default Server;