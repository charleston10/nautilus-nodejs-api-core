import fs from 'fs';
import path from 'path';
import { load } from 'dotenv/types';

const getExt = (filenName: any) => {
    return filenName.slice((Math.max(0, filenName.lastIndexOf(".")) || Infinity) + 1)
}

const isIndex = (filenName: any) => {
    return filenName.split(`.`)[0] == `index`
}

export const loader = (database: any, baseFolder: string) => {
    const loaded: any = [];
    const extSupported = [`ts`, `js`]

    fs
        .readdirSync(baseFolder)
        .filter((file) => {
            const isFileSupported = extSupported.includes(getExt(file));
            return (file.indexOf('.') !== 0) && !isIndex(file) && isFileSupported;
        })
        .forEach((file) => {
            const model = database['import'](path.join(baseFolder, file));
            const modelName = file.split('.')[0];
            loaded.push(
                {
                    entityName: modelName,
                    entityRefer: modelName.charAt(0).toLocaleLowerCase() + modelName.slice(1),
                    table: model
                }
            )
        });

    loaded.forEach((element: any) => {
        if (element.table.associate) {
            element.table.associate(loaded);
        }
    });


    return loaded;
}