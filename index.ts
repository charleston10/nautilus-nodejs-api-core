import {
    container,
    application,
    logger
} from './src';

application
    .register(container)
    .start(process.env.PORT || 3000)
    .catch((e: any) => {
        logger.error(e.stack);
        process.exit();
    })