import { INTERNAL_SERVER_ERROR } from 'http-status';

/* istanbul ignore next */
export default (err: any, req: any, res: any, next: any) => { // eslint-disable-line no-unused-vars
  const { logger } = req.container.cradle;

  logger.error(err);

  res.status(INTERNAL_SERVER_ERROR).json({
    type: 'InternalServerError',
    message: 'The server failed to handle this request'
  });
};