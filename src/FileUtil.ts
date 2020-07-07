import fs from 'fs';
import path from 'path';

class FileUtil {

    private _filesSupport = [`ts`, `js`]

    getInstances(folder: string): Array<any> {
        const instances: any = [];

        fs
            .readdirSync(folder)
            .filter((file: any) => {
                const isFileSupported = this._filesSupport.includes(this._getExt(file));
                return (file.indexOf('.') !== 0) && !this._isIndex(file) && isFileSupported;
            })
            .forEach((file: any) => {
                instances.push(this.getInstance(folder, file))
            });

        return instances;
    }

    getInstance(folder: string, file: string): any {
        return require(path.join(folder, file))
    }


    private _getExt(filenName: any): string {
        return filenName.slice((Math.max(0, filenName.lastIndexOf(".")) || Infinity) + 1)
    }

    private _isIndex(filenName: any): boolean {
        return filenName.split(`.`)[0] == `index`
    }
}

export default FileUtil