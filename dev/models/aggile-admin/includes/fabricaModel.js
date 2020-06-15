const sequelize = require('./entityes/index')
const _ = require('lodash')
const relation = require('./enuns/relation')
const utilModel = require('../extras/utils-model')
const utils = require('../../../helpers/_utils/utils')
const Op = sequelize.Sequelize.Op


let conexao = sequelize.sequelize

class FabricaModel {

    constructor() {
        this._model = sequelize.entity.Fabrica

        process.nextTick(() => {
            this._pessoaModel = require('./pessoaModel')
        })



    }

    async findDataIndexDB() {
        let query = {
            attributes: ['id'],
            include: [{
                model: sequelize.entity.Fabrica, as: 'fabrica', attributes: ['id', 'nomeFantasia', 'razaoSocial']
            }],
            where: { tipoPessoa: 'fabrica' }

        }

        let data = await sequelize.entity.Pessoa.findAll(query)

        data = _.map(data, row => {
            let { id, nomeFantasia, razaoSocial } = row.fabrica

            let aux = {
                pessoaId: row.id,
                id: id,
                nomeFantasia: nomeFantasia,
                razaoSocial: razaoSocial
            }

            return aux
        })

        return data
    }

    async findByAutoComplete(text = '') {


        let query = {
            where: { tipoPessoa: 'fabrica' },
            include: _.clone(relation().RelationPessoa(['fabrica'])),
        }

        if (utils.NumberUtil.isInt(text)) {
            query.where[Op.or] = [
                { id: utils.NumberUtil.cInt(text) },
                { fabricaId: utils.NumberUtil.cInt(text) }
            ]

        } else {

            query.include = query.include.map(row => {

                if (row.as == 'fabrica') {
                    row.where = {

                        [Op.or]: [
                            { razaoSocial: { [Op.like]: `%${text}%` } },
                            { nomeFantasia: { [Op.like]: `%${text}%` } },
                            { cnpj: { [Op.like]: `%${text}%` } },
                        ]
                    }

                    row.required = true
                }

                return row
            })
        }

        return await sequelize.entity.Pessoa.findAll(query)

    }



    async pesquisar(conditions = {}) {

        let where = {}

        let query = {
            include: relation().RelationPessoa(['fabrica']),
        }

        query.include.filter(row => {

            if (row.as == 'fabrica') {

                let whereInner = {}

                if (conditions.cnpj)
                    whereInner.cnpj = conditions.cnpj

                if (utils.ObjectUtil.getValueProperty(conditions, 'status') !== '')
                    whereInner.status = utils.StringUtil.stringToBool(conditions.status)

                row.where = whereInner
            }
        })




        if (conditions.fabricaId > 0)
            where.fabricaId = conditions.fabricaId

        if (conditions.id > 0)
            where.id = conditions.id


        if (!where.fabricaId && !where.id) {

            if (utils.ObjectUtil.getValueProperty(conditions, 'endereco.municipio.id') && !conditions.cnpj) {

                let fabricas = await this.fabricasByMunicipio(conditions.endereco.municipio.id)




                if (utils.ArrayUtil.length(clientes) == 0)
                    return []

                let ids = fabricas.map((item) => { return item.id })

                where.id = { [Op.in]: ids }
            }


        }

        if (Object.getOwnPropertyNames(where).length > 0)
            query.where = where


        if (utils.ObjectUtil.getValueProperty(conditions, 'paginator.limit'))
            query.limit = parseInt(conditions.paginator.limit)

        if (utils.ObjectUtil.getValueProperty(conditions, 'paginator.offset'))
            query.offset = parseInt(conditions.paginator.offset)


        return await sequelize.entity.Pessoa.findAll(query)
    }

    async fabricasByMunicipio(municipioId) {

        let query = {
            include: relation().RelationPessoa(['fabrica']),
        }



        query.include.filter(row => {

            if (row.as == 'enderecos')
                _.assign(row, { where: { municipioId: { [sequelize.Sequelize.Op.eq]: municipioId } }, separate: false, right: true, required: true })
        })


        return await sequelize.entity.Pessoa.findAll(query)




    }

    async update(data) {

        let fabricaExistente = await this._model.findByPk(data.fabrica.id)

        if (!fabricaExistente)
            throw 'Fábrica inválida!'


        utilModel.LoadModelToFormUtil.loadChangeModel(fabricaExistente, data)

        await conexao.transaction(async (transaction) => {


            await new this._pessoaModel().update(data, { idParent: data.id, tipoPessoa: 'fabrica' }, { validate: true, transaction: transaction })


            await fabricaExistente.save({ validate: true, transaction: transaction })

        })

        return await this.findOne({ fabricaId: fabricaExistente.id })
    }

    async createOrUpdate(data) {
        if (data.id)
            return await this.update(data)
        else
            return await this.save(data)
    }

    async save(data) {


        let fabrica = await conexao.transaction(async (transaction) => {


            let fabrica = await this._model.create(data.fabrica, { validate: true, transaction: transaction })

            await new this._pessoaModel().save(data, { idParent: fabrica.id, tipoPessoa: 'fabrica' }, { validate: true, transaction: transaction })

            return fabrica

        })

        return await this.findOne({ fabricaId: fabrica.id })


    }

    async findOne(conditions = {}) {
        let where = {
            include: relation().RelationPessoa(['fabrica']),
            where: conditions
        }
        return await sequelize.entity.Pessoa.findOne(where)
    }

    async findAll(conditions) {
        let where = {
            include: relation().RelationPessoa(['fabrica'])
        }

        if (conditions) {

            where = {
                where: conditions
            }
        }

        return await sequelize.entity.Pessoa.findAll(where)
    }



}


module.exports = FabricaModel