const sequelize = require('./entityes/index')
const _ = require('lodash')
const enums = require('./enuns/enum')
const Op = sequelize.Sequelize.Op
const utilModel = require('../extras/utils-model')
const relation = require('./enuns/relation')
const utils = require('../../../helpers/_utils/utils')


let conexao = sequelize.sequelize

class AgenciaModel {

    constructor() {
        this._model = sequelize.entity.Agencia

        process.nextTick(() => {
            this._pessoaModel = require('./pessoaModel')
        })
    }
    async pesquisar(conditions = {}) {

        let where = {}

        let query = {
            include: relation().RelationPessoa(['agencia']),
        }


        query.include.filter(row => {

            if (row.as == 'agencia') {

                let whereInner = {}

                if (conditions.cnpj)
                    whereInner.cnpjCpf = conditions.cnpj

                if (utils.ObjectUtil.getValueProperty(conditions, 'status') !== '')
                    whereInner.status = utils.StringUtil.stringToBool(conditions.status)

                if(conditions.bancoId)
                    whereInner.bancoId = conditions.bancoId

                row.where = whereInner



            }
        })



        if (conditions.agenciaId > 0)
            where.agenciaId = conditions.agenciaId

        if (conditions.id > 0)
            where.id = conditions.id



        if (!where.agenciaId && !where.id) {

            if (utils.ObjectUtil.getValueProperty(conditions, 'endereco.municipio.id') && !conditions.cnpj) {

                let agencias = await this.agenciasByMunicipio(conditions.endereco.municipio.id)




                if (utils.ArrayUtil.length(agencias) == 0)
                    return []

                let ids = agencias.map((item) => { return item.id })

                where.id = { [Op.in]: ids }
            }

            


        }




        if (Object.getOwnPropertyNames(where).length > 0)
            query.where = where


        if (conditions.paginator && ('limit' in conditions.paginator))
            query.limit = parseInt(conditions.paginator.limit)

        if (conditions.paginator && ('offset' in conditions.paginator))
            query.offset = parseInt(conditions.paginator.offset)


        return await sequelize.entity.Pessoa.findAll(query)
    }



    async findByAutoComplete(text = '') {



        let query = {
            where: { tipoPessoa: 'agencia' },
            include: _.clone(relation().RelationPessoa(['agencia'])),
        }

        if (utils.NumberUtil.isInt(text)) {
            query.where[Op.or] = [
                { id: utils.NumberUtil.cInt(text) },
                { agenciaId: utils.NumberUtil.cInt(text) }
            ]

        } else {

            query.include = query.include.map(row => {

                if (row.as == 'agencia') {
                    row.where = {

                        [Op.or]: [
                            { nome: { [Op.like]: `%${text}%` } },
                            { cnpjCpf: { [Op.like]: `%${text}%` } },
                            { contato: { [Op.like]: `%${text}%` } }
                        ]
                    }

                    row.required = true
                }

                return row
            })
        }

        return await sequelize.entity.Pessoa.findAll(query)

    }



    async agenciasByMunicipio(municipioId) {

        let query = {
            include: relation().RelationPessoa(['agencia']),
        }



        query.include.filter(row => {

            if (row.as == 'enderecos')
                _.assign(row, { where: { municipioId: { [sequelize.Sequelize.Op.eq]: municipioId } }, separate: false, right: true, required: true })
        })


        return await sequelize.entity.Pessoa.findAll(query)
    }


    async update(data) {


        await this.uniqueAgenciaMunicipio(data).catch(err => { throw err })


        let agenciaExistente = await this._model.findByPk(data.agencia.id)

        if (!agenciaExistente)
            throw 'Agência inválida!'


        utilModel.LoadModelToFormUtil.loadChangeModel(agenciaExistente, _.clone(data.agencia))


        await conexao.transaction(async (transaction) => {

            await new this._pessoaModel().update(data, { idParent: agenciaExistente.id, tipoPessoa: 'agencia' }, { validate: true, transaction: transaction })

            await agenciaExistente.save({ validate: true, transaction: transaction })

        })

        return await this.findOne({ agenciaId: agenciaExistente.id })
    }



    async createOrUpdate(data) {


        if (!isNaN(parseInt(data.id)))
            return await this.update(data)
        else
            return await this.save(data)
    }


    async uniqueAgenciaMunicipio(data = {}) {

        let query = {
            where: {},
            include: relation().RelationPessoa(['agencia'])
        }


        query.include.filter((row) => {

            if (row.as == 'enderecos') {

                _.assign(row,
                    {
                        where: { municipioId: { [sequelize.Sequelize.Op.eq]: data.endereco.municipio.id } },
                        separate: false, required: true
                    }
                )
            } else if (row.as == 'agencia') {

                row.where = {
                    [Op.or]: {
                        nome: data.agencia.nome,
                        numero: data.agencia.numero
                    }
                }
            }
        })


        if (data.id)
            query.where.id = { [sequelize.Sequelize.Op.ne]: data.id }


        let agenciaUnique = await sequelize.entity.Pessoa.findOne(query)


        if (agenciaUnique)
            return Promise.reject(`Agencia/Número já cadastrada para o município de ${agenciaUnique.endereco.municipio.descricao}!`)
        return Promise.resolve()


    }


    async save(data) {



        let agencia = await conexao.transaction(async (transaction) => {

            await this.uniqueAgenciaMunicipio(data)
                .catch(err => {
                    throw err
                })


            let agencia = await this._model.create(data.agencia, { validate: true, transaction: transaction })



            await new this._pessoaModel().save(data, { idParent: agencia.id, tipoPessoa: 'agencia' }, { validate: true, transaction: transaction })


            return agencia

        })

        return await this.findOne({ agenciaId: agencia.id })


    }


    async findOne(conditions = {}) {


        let where = {
            include: relation().RelationPessoa(['agencia']),
            where: conditions
        }

        return await sequelize.entity.Pessoa.findOne(where)
    }

    async findAll(conditions) {

        let where = {
            include: relation().RelationPessoa(['agencia'])
        }

        if (conditions) {

            where = {
                where: conditions
            }
        }

        return await sequelize.entity.Pessoa.findAll(where)
    }


}


module.exports = AgenciaModel