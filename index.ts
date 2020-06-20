import {
    container,
    application,
    database,
    logger
} from './src/Container';

application
    .register(container)   
    .start(process.env.PORT || 3000)
    .catch((e: any) => {
        logger.error(e.stack);
        process.exit();
    })