import { asValue, asClass, asFunction } from 'awilix';

import fs from 'fs';
import path from 'path';

const __instanceObject = (instance: any, type: any) => {
    switch (type) {
        case 'value':
            return asValue(instance);
        case 'class':
            return asClass(instance);
        case 'function':
            return asFunction(instance);
    }
};

const __inject = (baseFolder: string, type: string) => {
    var indexFile = 'index.ts';
    var instances: any = [];

    fs
        .readdirSync(baseFolder)
        .filter((file: any) => {
            return (file.indexOf('.') !== 0) && (file !== indexFile) && (file.slice(-3) === '.ts');
        })
        .forEach((file: any) => {
            let instance = require(path.join(baseFolder, file));
            let fileName = file.split('.')[0];
            let instanceName = fileName.charAt(0).toLowerCase() + fileName.slice(1)

            instances[instanceName] = __instanceObject(instance, type);
        });

    return instances;
};

export default {
    injectClass: (baseFolder: string) => __inject(baseFolder, 'class'),
    injectFunction: (baseFolder: string) => __inject(baseFolder, 'function'),
    injectValue: (baseFolder: string) => __inject(baseFolder, 'value')
}