import { loader } from './EntityLoader';
import { Sequelize } from 'sequelize';
import { asValue } from 'awilix';

class Database {

    private _container: any;
    private _logger: any;
    private _sequelize: any;
    private _pathEntities: string = "";

    constructor({ logger }: any) {
        this._logger = logger;
    }

    register(container: any) {
        this._container = container;
        return this;
    }

    connect() {
        if (process.env.DB_NAME) {
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

    loadEntity(path: string, basePath: string) {
        this._pathEntities = `${basePath}\\${path}`;
        return this;
    }

    sequelize() {
        return this.sequelize;
    }

    private _config() {
        const dialect: any = process.env.DB_DIALECT

        this._sequelize = new Sequelize(
            process.env.DB_NAME || "",
            process.env.DB_USERNAME || "",
            process.env.DB_PASSWORD || "",
            {
                host: process.env.DB_HOST || "",
                dialect: dialect
            }
        );
    }

    private _connect() {
        this._sequelize.authenticate()
            .then(() => {
                this._logger.info(`[database] ${process.env.DB_NAME} connected`);
            })
            .catch((err: any) => {
                this._logger.error(`[database] error in connection`, err);
            });
    }

    /**
     * Declare all entities how to object injetable
     */
    private _loadEntity() {
        const loaded = loader(
            this._sequelize,
            this._pathEntities
        );

        loaded.forEach((_element: any) => {
            const injectable: any = {};
            injectable[_element.entityRefer] = asValue(_element.table);
            this._container.register(injectable)
        });

        this._logger.info('[database] loaded entities', loaded);
    }
}

export default Database