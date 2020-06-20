import ValidateException from '../errors/exceptions/ValidateException';

class BaseRepository {

    private entity: any;
    private mapper: any;

    constructor(entity: any, mapper: any) {
        this.entity = entity;
        this.mapper = mapper;
    }

    async getTransaction() {
        return this.entity.sequelize.transaction();
    }

    async getAll(...args: string[]) {
        const list = await this.entity.findAll(...args);
        return list.map(this.mapper.toModel);
    }

    async getById(id: Number) {
        const user = await this._getById(id);
        return this.mapper.toModel(user);
    }

    async add(data: any, transaction: any) {
        const { valid, errors } = data.validate();

        if (!valid) {
            throw new ValidateException('ValidationError', errors);
        }

        const entity = this.mapper.toEntity(data);
        const newData = await this.entity.create(entity, { transaction });
        const model = this.mapper.toModel(newData);
        return model;
    }

    async remove(id: Number) {
        const data = await this._getById(id);

        await data.destroy();
        return;
    }

    async update(id: Number, newData: any) {
        const user = await this._getById(id);

        const transaction = await this.entity.sequelize.transaction();

        try {
            const updateData = await user.update(newData, { transaction });

            const entity = this.mapper.toModel(updateData);

            const { valid, errors } = entity.validate();

            if (!valid) {
                throw new ValidateException('ValidationError', errors);
            }

            await transaction.commit();

            return entity;
        } catch (error) {
            await transaction.rollback();

            throw error;
        }
    }

    async count() {
        return await this.entity.count();
    }

    private async _getById(id: Number) {
        try {
            let data = await this.entity.findOne({ where: { id: id } }, { rejectOnEmpty: true });

            if (data === null) {
                return this._errorNotFound(id);
            }

            return data;
        } catch (error) {
            return this._errorNotFound(id);
        }
    }

    private _errorNotFound(id: Number) {
        throw new ValidateException('NotFoundError', `Object with id ${id} can't be found.`);
    }
}

export default BaseRepository;