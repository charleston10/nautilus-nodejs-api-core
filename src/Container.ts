import { createContainer, asClass, asFunction, asValue } from 'awilix';
import Application from './Application';
import Server from './Server';
import log from './logging/logger';
import { errorHandler, devErrorHandler } from './errors';
import loggerMiddleware from './logging/loggerMiddleware';
import Database from './database/Database';
import { config } from 'dotenv';

config()

const container = createContainer();

container
    .register({
        application: asClass(Application).singleton(),
        server: asClass(Server).singleton(),
        logger: asFunction(log).singleton(),
        errorHandler: asValue(process.env.NODE_ENV == 'production' ? errorHandler : devErrorHandler),
        loggerMiddleware: asFunction(loggerMiddleware).singleton(),
        database: asClass(Database).singleton()
    });

const application = (container.resolve('application') as Application);
const database = (container.resolve('database') as Database);
const logger: any = container.resolve('logger');

export {
    container,
    application,
    database,
    logger
}