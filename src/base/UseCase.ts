import { EventEmitter } from 'events';
const define = Object.defineProperty;

class UseCase extends EventEmitter {
  [x: string]: any;

  static setOutputs(outputs: any) {
    define(this.prototype, 'outputs', {
      value: createOutputs(outputs)
    });
  }

  on(output: any, handler: any) {
    if (this.outputs[output]) {
      return this.addListener(output, handler);
    }

    throw new Error(`Invalid output "${output}" to UseCase ${this.constructor.name}.`);
  }
}

const createOutputs = (outputsArray: any) => {
  return outputsArray.reduce((obj: any, output: any) => {
    obj[output] = output;
    return obj;
  }, Object.create(null));
};

export default UseCase;