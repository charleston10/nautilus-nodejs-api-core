import { Lifetime } from 'awilix';
import path from "path"

import Injector from './Injector';
import Server from './Server';
import Database from './database/Database';
import FileUtil from './FileUtil';

class Application {

    private _server: Server;
    private _database: Database;
    private _container: any;

    constructor({ server, database }: any) {
        this._server = server;
        this._database = database;
    }

    register(container: any) {
        this._container = container;
        this._server.register(container);
        return this;
    }

    async startServer(port: any) {
        this._server.start(port);
        return this;
    }

    startDatabase() {
        this._database.connect();
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
        return this;
    }

    loadClass(paths: Array<String>, basePath: string) {
        paths.forEach((element: any) => {
            const injectable = Injector.injectClass(path.join(basePath, element));
            this._registerClass(injectable);
        });

        return this;
    }

    loadValues(paths: Array<String>, basePath: string) {
        paths.forEach((element: any) => {
            const injectable = Injector.injectValue(path.join(basePath, element));
            this._registerClass(injectable);
        });

        return this;
    }

    loadMiddleware(paths: Array<String>, basePath: string) {
        const fileUtil = new FileUtil()

        paths.forEach((element: any) => {
            const middlewares = fileUtil.getInstances(path.join(basePath, element))

            middlewares.reverse().forEach((middleware:any) => {
                this._server.addMidleware(middleware)
            })
        });

        return this;
    }

    getDatabase() {
        return this._database;
    }

    getServer() {
        return this._server;
    }

    private _registerClass(injectable: any) {
        this._container.register(injectable);
    }
}

export default Application;