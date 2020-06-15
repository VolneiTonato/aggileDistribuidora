const sequelize = require('./entityes/index')
const _ = require('lodash')
const relation = require('./enuns/relation')
const utilModel = require('../extras/utils-model')

class EnderecoModel {

    constructor() {
        this._model = sequelize.entity.Endereco
    }


    async pesquisar(conditions = {}) {

        let where = {}




        if (conditions.id > 0) {
            where.id = conditions.id
        } else {




            if (conditions.pessoaId)
                where.pessoaId = conditions.pessoaId

        }

        let query = {
            include: relation().RelationEndereco
        }

        if (Object.getOwnPropertyNames(where).length > 0)
            query.where = where


        if (conditions.paginator && ('limit' in conditions.paginator))
            query.limit = parseInt(conditions.paginator.limit)

        if (conditions.paginator && ('offset' in conditions.paginator))
            query.offset = parseInt(conditions.paginator.offset)


        return await this._model.findAll(query)
    }

    async saveRelation(data, pessoa = {}, options) {

        let enderecoExistente = await this.findOne(data.id)

        if (enderecoExistente) {
            utilModel.LoadModelToFormUtil.loadChangeModel(enderecoExistente, data)
            await enderecoExistente.save(options)

            return enderecoExistente
        }



        data.municipioId = data.municipio.id
        data.pessoaId = pessoa.id
        data.tipoPessoa = pessoa.type
        data.isPrincipal = true

        return await this._model.create(data, options)
    }




    async updateRelation(data, pessoa, options) {

        let enderecoExistente = await this.findOne(data.id)

        utilModel.LoadModelToFormUtil.loadChangeModel(enderecoExistente, data)

        await enderecoExistente.save(options)

        return enderecoExistente
    }


    async update(data) {

        data.isPrincipal = false

        let enderecoExistente = await this.findOne(data.id)

        utilModel.LoadModelToFormUtil.loadChangeModel(enderecoExistente, data)

        await enderecoExistente.save({ validate: true })

        return enderecoExistente
    }

    async createOrUpdate(data) {

        if (!isNaN(parseInt(data.id)))
            return await this.update(data)
        else
            return await this.save(data)
    }

    async save(data) {

        _.unset(data, 'id')

        data.municipioId = data.municipio.id

        let success = await this._model.create(data, { validate: true })

        return await this.findOne(success.id)
    }


    async findOne(id) {


        let where = {
            include: relation().RelationEndereco,
            where: { id: id }
        }

        return await this._model.findOne(where)
    }

    async findAll(conditions) {

        let where = {
            include: relation().RelationEndereco
        }

        if (conditions) {

            where = {
                where: conditions
            }
        }

        return await this._model.findAll(where)
    }

}


module.exports = EnderecoModel