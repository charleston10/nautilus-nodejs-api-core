import morgan from 'morgan';
import adapter from './LoggerStreamAdapter'

export = ({ logger }: any) => {
  return morgan('dev', {
    stream: adapter.toStream(logger),
    skip: (req, res) => process.env.NODE_ENV === 'test'
  });
};