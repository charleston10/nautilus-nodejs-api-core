# Nautilustar API Core

NautilusStar API Core is a standard feature set of an api

It serves as a core module for building api for microservices

It has all integration with http server, routes, database, logs and injection dependency

To facilitate integration and development, the Clean architecture concept is used, but you can use any type of architecture.

It is possible to make declarations from Mappers, Entities, Model, Repositories, UseCase, Controllers etc.

## Installation

Install with `npm`

```npm i nautilus-nodejs-api-core --save```

Npm Package https://www.npmjs.com/package/nautilus-nodejs-api-core

## Sample

Repo https://github.com/charleston10/nautilus-nodejs-api-users-sample.git

```git clone https://github.com/charleston10/nautilus-nodejs-api-users-sample.git```

## Usage

This configuration based in Clean Architecture

(input request http) Presentration -> Domain -> Data 

(output response htttp) Data -> Domain -> Presentation 

```javascript
import path from "path"

import {
    container,
    application,
    database,
    logger
} from 'nautilus-nodejs-api-core';

//create all config the application
//register mappers, model, repository, usecase and controllers
//all classes and files will be available to be injected in context of application
application
    .register(container)
    .loadValues([
        path.join(`data`, `mappers`), 
        path.join(`domain`, `model`)
    ], __dirname)//declare functions and files for inject 
    .loadModules([
        path.join(`data`, `repository`, `*.*`),
        path.join(`domain`, `usecase`, `**`, `*.*`)
    ], __dirname)//load modules core of your application to inject
    .loadRoutes(
        path.join(`presentation`, `controllers`, `*.*`)
    , __dirname)//declares routes from api to server
    .loadMiddleware([
        path.join(`core`, `middleware`)
    ], __dirname)//load middlewares
    .loadDatabase(
        database
            .register(container)
            .configure({...})//connection sequelize
            .loadEntity(
                path.join(`data`, `local`, `entities`),
                __dirname
            )
    )
    .startDatabase()
    .startServer(process.env.PORT || 3000)//get informations by .env
    .catch((e: any) => {
        logger.error(e.stack);//log all error stack
        process.exit();
    })
```

## Quick start

All classes is enable for inject named with first letter in lowerCase
Example: GetUserUseCase is enabled how getUserUseCase


### How to config routes

The configuration of the controllers is the entire gateway to the application, where it is found in the Presentation layer of our architecture
Here we can process input and output, searching the data through UseCase that will execute the necessary rule for the operation

```javascript
import { route, GET, POST } from 'awilix-express';
import HTTP_STATUS from 'http-status';

@route('/users')
export default class UserController {

    //variable injected using UserUseCase
    //classes registered in container in loadModules(domain)
    private _getAll: any;
    private _create: any;

    constructor({ getAll, create }: any) {
        this._getAll = getAll;
        this._create = create;
    }

    @GET()
    async get(req: any, res: any, next: any) {
        const { SUCCESS, ERROR } = this._getAll.outputs;

        this._getAll
            .on(SUCCESS, (listResult: Array<Object>) => {
                res
                    .status(HTTP_STATUS.OK)
                    .json(listResult);
            })
            .on(ERROR, next);

        this._getAll.execute();
    }

    @POST()
    async create(req: any, res: any, next: any) {
        const { SUCCESS, ERROR } = this._create.outputs;

        this._create
            .on(SUCCESS, (result: Object) => {
                res
                    .status(HTTP_STATUS.OK)
                    .json(result);
            })
            .on(ERROR, next);

        this._create.execute(req.body);
    }
}
```


### How to config UseCase

The UseCase component is responsible for executing all business rules of the project
It has an asynchronous execution and can emit any result through events
The usecase event in this case and the SUCCESS and ERROR event can be customized according to the need

**Create User UseCase**


```javascript

import { UseCase } from 'nautilus-nodejs-api-core'

class Create extends UseCase {

    //variable injected using UserRepository and UserModel
    //classes registered in container in loadModules(repository) and loadValues(model)
    private repository: any;
    private Model: any;

    constructor({ userRepository, userModel }: any) {
        super()
        this.repository = userRepository;
        this.Model = userModel;
    }

    async execute(data: any) {
        const { SUCCESS, ERROR } = this.outputs;

        const model = new this.Model(data);

        try {
            const newData = await this.repository.add(model);
            this.emit(SUCCESS, newData);
        } catch (error) {
            this.emit(ERROR, error);
        }
    }
}

Create.setOutputs(['SUCCESS', 'ERROR']);

export default Create;
```

**Get All User UseCase**

```javascript
import { UseCase } from 'nautilus-nodejs-api-core'

class GetAll extends UseCase {

    private repository: any;

    //variable injected using UserRepository
    //classes registered in container in loadModules(repository)
    constructor({ userRepository }: any) {
        super()
        this.repository = userRepository;
    }

    async execute() {
        const { SUCCESS, ERROR } = this.outputs;

        try {
            const data = await this.repository.getAll();
            
            this.emit(SUCCESS, data);
        } catch (error) {
            this.emit(ERROR, error);
        }
    }
}

GetAll.setOutputs(['SUCCESS', 'ERROR']);

export default GetAll;
```

### How to config Repository

All repositories are responsible for obtaining access data, in this case, entering the database

Within our core module, there are some standard data access and writing functions that make it easier in our daily lives
Using the class extension, it offers the functions

GetAll, GetByIDd, Add, Remove, Update, Count and even Transaction

The transaction you can use to make multiple inserts and rollback if needed

And the methods can be overridden if necessary

**Create User Repostiory**

```javascript
import { BaseRepository } from 'nautilus-nodejs-api-core'

class UserRepository extends BaseRepository {

    constructor({ userEntity, userMapper }: any) {
        super(userEntity, userMapper);
    }
}

export default UserRepository;
```

### How to config Middlewares
Most of the time, we need to add middleware to our api In a simple case, add Middleware to add an ID to identify a request made.

Observation: An order that is being executed is an order that is in the folder (alphabetical order)

Example

```javascript
const crypto = require("crypto");
 
export = (req: any, res: any, next: any) => {
    const id = crypto.randomBytes(10).toString("hex");
    req.requestId = id;
    next()
}
```

Add this middleware in our application

```javascript
import path from 'path';
 
application
    .register(container)
    .loadMiddleware([
        path.join(`core`, `middlewares`),//or [core//middlewares]
    ], __dirname)//add any middlewares

```

### How to config Database

All database configuration is based on Sequelize, so the use of any database is dynamic and there is a working pattern

To specify the bank registration data, it is necessary to use the settings in environment variables
The module itself can see the values and make the connection normally

```javascript
application.loadDatabase(
        database
            .register(container)
            .configure({
                host: process.env.DB_HOST,
                dialect: process.env.DB_DIALECT,
                database: process.env.DB_NAME,
                username: process.env.DB_USERNAME,
                password: process.env.DB_PASSWORD,
                options: { logging: false }
            })
            .loadEntity(
                path.join(`data`, `local`, `entities`),
                __dirname
            )
    )
```

## Dependencies

- [Node v7.6+](http://nodejs.org/)
- [Express](https://npmjs.com/package/express)
- [Sequelize](https://www.npmjs.com/package/sequelize)
- [Awilix](https://www.npmjs.com/package/awilix)
- [Structure](https://www.npmjs.com/package/structure)
- [HTTP Status](https://www.npmjs.com/package/http-status)
- [Log4js](https://www.npmjs.com/package/log4js)
- [Morgan](https://www.npmjs.com/package/morgan)
- [Express Status Monitor](https://www.npmjs.com/package/express-status-monitor)
- [Nodemon](https://www.npmjs.com/package/nodemon)
- [PM2](https://www.npmjs.com/package/pm2)
- [Mocha](https://www.npmjs.com/package/mocha)
- [Chai](https://www.npmjs.com/package/chai)
- [FactoryGirl](https://www.npmjs.com/package/factory-girl)
- [Istanbul](https://www.npmjs.com/package/istanbul) + [NYC](https://www.npmjs.com/package/nyc)
- [ESLint](https://www.npmjs.com/package/eslint)

## Special thanks

Culture for innovation time in my project [TraceFacil](www.tracefacil.com)
and inspired in [boilerplate](https://github.com/charleston10/api-nodejs-clean-architecture) nodejs
