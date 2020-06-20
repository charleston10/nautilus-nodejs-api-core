# Nautilustar API Core

NautilusStar API Core is a standard feature set of an api

It serves as a core module for building api for microservices

It has all integration with http server, routes, database, logs and injection dependency

To facilitate integration and development, the Clean architecture concept is used, but you can use any type of architecture.

It is possible to make declarations from Mappers, Entities, Model, Repositories, UseCase, Controllers etc.

APIs focused on separation of concerns and scalability with Clean Architecture

- **Multilayer folder structure:**
Code organization inspired by DDD and Clean Architecture focused on codebase scalability.

- **Scalable and easy to use web server:**
Use Express for requests routing and middlewares. There are some essential middlewares for web APIs already setup, like body-parser, compression, CORS and method-override.

- **Database integration:**
Sequelize, an ORM for SQL databases, is already integrated, you just have to set the authentication configurations.

- **Prepared for testing:**
The test suite uses Mocha/Chai and is prepared to run unit, integration and functional tests right from the beginning. There are helpers to make it easy to make requests to the web app during the tests and for cleaning the database after each test. A FactoryGirl adapter for Sequelize is setup to make your tests DRY as well, and the tests generate code coverage measurement with Istanbul. You should read about the Chai plugins that are setup by default too.

- **Dependency injection:**
With Awilix, a practical dependency injection library, the code will not be coupled and it'll still be easy to resolve automatically the dependencies on the runtime and mock them during the tests. It's even possible inject dependencies on your controllers with the Awilix Express adapter. Click here if you want to read more about how to use dependency injection with this boilerplate.

- **Logging:**
The Log4js logger is highly pluggable, being able to append the messages to a file during the development and send them to a logging service when on production. Even the requests (through morgan) and queries will be logged.

- **Linter:**
It's also setup with ESLint to make it easy to ensure a code styling and find code smells.

## Installation

Install with `npm`

```npm install awilix --save```

## Sample

Repo https://github.com/charleston10/nautilus-nodejs-api-users-sample.git

```git clone https://github.com/charleston10/nautilus-nodejs-api-users-sample.git```

## Usage

This configuration based in Clean Architecture

(input request http) Presentration -> Domain -> Data 

(output response htttp) Data -> Domain -> Presentation 

```javascript
import {
    container,
    application,
    database,
    logger
} from 'nautilus-nodejs-api-core';

//create register database
//is used sequelize for create the configuration
//the config database is .env
database
    .register(container)
    .loadEntity(`data\\local\\entities`, __dirname);//import entities of datbase

//create all config the application
//register mappers, model, repository, usecase and controllers
//all classes and files will be available to be injected in context of application
application
    .register(container)
    .loadValues(['data\\mappers', 'domain\\model'], __dirname)//declare functions and files for inject 
    .loadModules([
        'data\\repository\\*.ts',
        'domain\\usecase\\*.ts'
    ], __dirname)//load modules core of your application to inject
    .loadRoutes('presentation\\controllers\\*.ts', __dirname)//declares routes from api to server
    .start(process.env.PORT || 3000)//get informations by .env
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

### How to config Database

All database configuration is based on Sequelize, so the use of any database is dynamic and there is a working pattern

To specify the bank registration data, it is necessary to use the settings in environment variables
The module itself can see the values and make the connection normally

```
DB_USERNAME=db_username
DB_PASSWORD=yourpassword
DB_NAME=db_name
DB_HOST=localhost
DB_DIALECT=postgres

PORT=8081
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