import { INTERNAL_SERVER_ERROR } from 'http-status';

/* istanbul ignore next */
export = (err: any, req: any, res: any, next:any) => { // eslint-disable-line no-unused-vars
  const { logger } = req.container.cradle;

  let code = INTERNAL_SERVER_ERROR;
  const result = {
    type: 'InternalServerError',
    message: err.message,
    stack: err.stack,
    errors: []
  }

  logger.error(err);

  res.status(code).json(result);
};