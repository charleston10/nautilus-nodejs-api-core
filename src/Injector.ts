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
    const extSupported = [`ts`, `js`]
    var instances: any = [];

    fs
        .readdirSync(baseFolder)
        .filter((file: any) => {
            const isFileSupported = extSupported.includes(_getExt(file));
            return (file.indexOf('.') !== 0) && !_isIndex(file) && isFileSupported;
        })
        .forEach((file: any) => {
            let instance = require(path.join(baseFolder, file));
            let fileName = file.split('.')[0];
            let instanceName = fileName.charAt(0).toLowerCase() + fileName.slice(1)

            instances[instanceName] = __instanceObject(instance, type);
        });

    return instances;
};

const _getExt = (filenName: any) => {
    return filenName.slice((Math.max(0, filenName.lastIndexOf(".")) || Infinity) + 1)
}

const _isIndex = (filenName: any) => {
    return filenName.split(`.`)[0] == `index`
}

export default {
    injectClass: (baseFolder: string) => __inject(baseFolder, 'class'),
    injectFunction: (baseFolder: string) => __inject(baseFolder, 'function'),
    injectValue: (baseFolder: string) => __inject(baseFolder, 'value')
}