import { loader } from './EntityLoader';
import { Sequelize } from 'sequelize';
import { asValue } from 'awilix';

class Database {

    private _container: any;
    private _logger: any;
    private _sequelize: any;
    private _pathEntities: string = "";
    private _entitiesLoaded: any;
    private _options: any;

    constructor({ logger }: any) {
        this._logger = logger;
    }

    register(container: any) {
        this._container = container;
        return this;
    }

    connect(options: any) {
        if (options || process.env.DB_NAME) {
            this._options = options;
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
        return this._sequelize;
    }

    entitiesLoaded() {
        return this._entitiesLoaded;
    }

    options(options: any){
        this._options = options;
        return this;
    }

    private _config() {
        const dialect: any = this._options?.dialect || process.env.DB_DIALECT

        this._sequelize = new Sequelize(
            this._options?.dbName || process.env.DB_NAME || "",
            this._options?.dbUsername || process.env.DB_USERNAME || "",
            this._options?.dbPassword || process.env.DB_PASSWORD || "",
            {
                host: this._options?.dbHost || process.env.DB_HOST || "",
                dialect: dialect,
                logging: this._options?.logging || true
            }
        );
    }

    private _connect() {
        this._sequelize.authenticate()
            .then(() => {
                this._logger.info(`[database] ${this._options.dbName || process.env.DB_NAME} connected`);
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