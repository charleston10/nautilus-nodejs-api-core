import { Lifetime } from 'awilix';
import Injector from './Injector';

class Application {

    private _server: any;
    private _container: any;
    private _database: any;

    constructor({ server, database }: any) {
        this._server = server;
        this._database = database;
    }

    register(container: any) {
        this._container = container;
        this._server.register(container);
        return this;
    }

    async start(port: any) {
        this._server.start(port);
        return this;
    }

    loadRoutes(path: string, basePath: string) {
        this._server.controllers(path, basePath);
        return this;
    }

    loadModules(path: Array<String>, basePath: string) {
        this._container.loadModules(path, {
            formatName: 'camelCase',
            cwd: basePath,
            resolverOptions: {
                lifetime: Lifetime.SCOPED
            }
        });

        return this;
    }

    loadDatabase(database: any) {
        this._database = database;
        this._database.connect();
        return this;
    }

    loadClass(path: Array<String>, basePath: string) {
        path.forEach(element => {
            const injectable = Injector.injectClass(`${basePath}\\${element}`);
            this._registerClass(injectable);
        });

        return this;
    }

    loadValues(path: Array<String>, basePath: string) {
        path.forEach(element => {
            const injectable = Injector.injectValue(`${basePath}\\${element}`);
            this._registerClass(injectable);
        });

        return this;
    }

    private _registerClass(injectable: any) {
        this._container.register(injectable);
    }
}

export default Application;