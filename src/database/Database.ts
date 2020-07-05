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

    constructor({ logger }: any) {
        this._logger = logger;
    }

    register(container: any) {
        this._container = container;
        return this;
    }

    connect(configuration: any = null) {
        if (configuration || process.env.DB_NAME) {
            if (!this._configuration) this._configuration = configuration;
            this._config();
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

    configure(options: any) {
        this._configuration = options;
        return this;
    }

    test(options: any = null) {
        if (options) {
            this._sequelize = new Sequelize(options)
        } else {
            this._sequelize = new Sequelize('sqlite::memory:')
        }

        this._sequelize.query('CREATE DATABASE IF NOT EXISTS dbTest', { raw: true });

        return this;
    }

    private _config() {
        const dialect: any = this._configuration?.dialect || process.env.DB_DIALECT

        this._sequelize = new Sequelize(
            this._configuration?.dbName || process.env.DB_NAME || "",
            this._configuration?.dbUsername || process.env.DB_USERNAME || "",
            this._configuration?.dbPassword || process.env.DB_PASSWORD || "",
            {
                host: this._configuration?.dbHost || process.env.DB_HOST || "",
                dialect: dialect,
                ...this._configuration?.options
            }
        );
    }

    private _connect() {
        this._sequelize.authenticate()
            .then(() => {
                this._logger.info(`[database] ${this._configuration?.dbName || process.env.DB_NAME} connected`);
            })
            .catch((err: any) => {
                this._logger.error(`[database] error in connection`, err);
            });
    }

    /**
     * Declare all entities how to object injetable
     */
    private _loadEntity() {
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

export default Database