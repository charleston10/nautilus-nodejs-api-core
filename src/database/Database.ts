import { loader } from './EntityLoader';
import { Sequelize } from 'sequelize';
import { asValue } from 'awilix';
import path from "path"

class Database {

    private _container: any;
    private _logger: any;
    private _sequelize: any;
    private _pathEntities: string = "";
    private _entitiesLoaded: any;
    private _configuration: any;
    private _isTest = false

    constructor({ logger }: any) {
        this._logger = logger;
    }

    register(container: any) {
        this._container = container;
        return this;
    }

    connect() {
        if (this._configuration) {
            this._connect();
            this._loadEntity();
        } else {
            this._logger.info('Not database configured for this application')
        }
        return this;
    }

    disconnect() {
        this._sequelize.close();
        return this;
    }

    loadEntity(pathFile: string, basePath: string) {
        this._pathEntities = path.join(basePath, pathFile)
        return this;
    }

    sequelize() {
        return this._sequelize;
    }

    entitiesLoaded() {
        return this._entitiesLoaded;
    }

    /**
     * Configure sequelize connection
     * 
     * @param configuration {object}
     */
    configure(configuration: any) {
        this._configuration = configuration;

        this._sequelize = new Sequelize(this._configuration)

        return this;
    }

    test() {
        this._isTest = true
        return this;
    }

    private _connect() {
        this._sequelize.authenticate()
            .then(() => {
                const mode = (this._isTest) ? "[test]" : ""
                this._logger.info(`[database]${mode} ${this._configuration.database} connected`);
            })
            .catch((err: any) => {
                this._logger.error(`[database] error in connection`, err);
            });
    }

    /**
     * Declare all entities how to object injetable
     */
    private _loadEntity() {
        if (this._pathEntities) {
            this._entitiesLoaded = loader(
                this._sequelize,
                this._pathEntities
            );

            this._entitiesLoaded.forEach((_element: any) => {
                const injectable: any = {};
                injectable[_element.entityRefer] = asValue(_element.table);
                this._container.register(injectable)
            });
        }
    }
}

export default Database