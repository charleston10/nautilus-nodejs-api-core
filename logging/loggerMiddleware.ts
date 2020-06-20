import morgan from 'morgan';
import adapter from './LoggerStreamAdapter'

export = ({ logger }: any) => {
  return morgan('dev', {
    stream: adapter.toStream(logger)
  });
};