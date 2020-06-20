import fs from 'fs';
import path from 'path';
import { load } from 'dotenv/types';

export const loader = (database: any, baseFolder: string) => {
    const loaded: any = [];

    fs
        .readdirSync(baseFolder)
        .filter((file) => {
            return (file.indexOf('.') !== 0) && (file !== "index.ts") && (file.slice(-3) === '.ts');
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