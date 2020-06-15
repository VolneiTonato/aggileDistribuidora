const sequelize = require('./entityes/index')
const _ = require('lodash')
const enums = require('./enuns/enum')
const Op = sequelize.Sequelize.Op
const utilModel = require('../extras/utils-model')
const relation = require('./enuns/relation')
const utils = require('../../../helpers/_utils/utils')


let conexao = sequelize.sequelize

class CedenteModel {

    constructor() {
        this._model = sequelize.entity.Cedente

        process.nextTick(() => {
            this._pessoaModel = require('./pessoaModel')
        })
    }


    async pesquisar(conditions = {}) {

        let where = {}

        let query = {
            include: relation().RelationPessoa(['cedente']),
        }

        query.include.filter(row => {

            if (row.as == 'cedente') {

                let whereInner = {}

                if (conditions.cnpj)
                    whereInner.cnpjCpf = conditions.cnpj

                if (utils.ObjectUtil.getValueProperty(conditions, 'status') !== '')
                    whereInner.status = utils.StringUtil.stringToBool(conditions.status)

                row.where = whereInner
            }
        })



        if (conditions.cedenteId > 0)
            where.cedenteId = conditions.cedenteId

        if (conditions.id > 0)
            where.id = conditions.id



        if (!where.cedenteId && !where.id) {

            if (utils.ObjectUtil.getValueProperty(conditions, 'endereco.municipio.id') && !conditions.cnpj) {

                let cedentes = await this.cedenteByMunicipio(conditions.endereco.municipio.id)




                if (utils.ArrayUtil.length(cedentes) == 0)
                    return []

                let ids = cedentes.map((item) => { return item.id })

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
            where: { tipoPessoa: 'cedente' },
            include: _.clone(relation().RelationPessoa(['cedente'])),
        }

        if (utils.NumberUtil.isInt(text)) {
            query.where[Op.or] = [
                { id: utils.NumberUtil.cInt(text) },
                { cedenteId: utils.NumberUtil.cInt(text) }
            ]

        } else {

            query.include = query.include.map(row => {

                if (row.as == 'cedente') {
                    row.where = {

                        [Op.or]: [
                            { razaoSocial: { [Op.like]: `%${text}%` } },
                            { nomeFantasia: { [Op.like]: `%${text}%` } },
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



    async cedenteByMunicipio(municipioId) {

        let query = {
            include: relation().RelationPessoa(['cedente']),
        }



        query.include.filter(row => {

            if (row.as == 'enderecos')
                _.assign(row, { where: { municipioId: { [sequelize.Sequelize.Op.eq]: municipioId } }, separate: false, right: true, required: true })
        })


        return await sequelize.entity.Pessoa.findAll(query)




    }


    async update(data) {


        await this.uniqueRazaoSocialNomeFantasiaMunicipio(data).catch(err => { throw err })


        let cedenteExistente = await this._model.findByPk(data.cedente.id)

        if (!cedenteExistente)
            throw 'Cedente inválido!'


        utilModel.LoadModelToFormUtil.loadChangeModel(cedenteExistente, _.clone(data.cedente))


        await conexao.transaction(async (transaction) => {

            await new this._pessoaModel().update(data, { isComplementoValidate: false, idParent: cedenteExistente.id, tipoPessoa: 'cedente' }, { validate: true, transaction: transaction })

            await cedenteExistente.save({ validate: true, transaction: transaction })

        })

        return await this.findOne({ cedenteId: cedenteExistente.id })
    }


    async createOrUpdate(data) {

        if (!isNaN(parseInt(data.id)))
            return await this.update(data)
        else
            return await this.save(data)
    }

    async uniqueRazaoSocialNomeFantasiaMunicipio(data = {}) {

        let query = {
            where: {},
            include: relation().RelationPessoa(['cedente'])
        }


        query.include.filter((row) => {

            if (row.as == 'enderecos') {

                _.assign(row,
                    {
                        where: { municipioId: { [sequelize.Sequelize.Op.eq]: data.endereco.municipio.id } },
                        separate: false, required: true
                    }
                )
            } else if (row.as == 'cedente') {

                row.where = {
                    [Op.or]: {
                        razaoSocial: data.cedente.razaoSocial,
                        nomeFantasia: data.cedente.nomeFantasia
                    }
                }
            }
        })


        if (data.id)
            query.where.id = { [sequelize.Sequelize.Op.ne]: data.id }


        let cedenteUnique = await sequelize.entity.Pessoa.findOne(query)


        if (cedenteUnique)
            return Promise.reject(`Razão Social e/ou Nome fantasia já cadastrada para o município de ${cedenteUnique.endereco.municipio.descricao}!`)
        return Promise.resolve()


    }


    async save(data) {



        let cedente = await conexao.transaction(async (transaction) => {

            await this.uniqueRazaoSocialNomeFantasiaMunicipio(data)
                .catch(err => {
                    throw err
                })


            let cedente = await this._model.create(data.cedente, { validate: true, transaction: transaction })


            await new this._pessoaModel().save(data, { isComplementoValidate:false, idParent: cedente.id, tipoPessoa: 'cedente' }, { validate: true, transaction: transaction })


            return cedente

        })

        return await this.findOne({ cedenteId: cedente.id })


    }



    async findOne(conditions = {}) {


        let where = {
            include: relation().RelationPessoa(['cedente']),
            where: conditions
        }

        return await sequelize.entity.Pessoa.findOne(where)
    }

    async findAll(conditions) {

        let where = {
            include: relation().RelationPessoa(['cedente'])
        }

        if (conditions) {

            where = {
                where: conditions
            }
        }

        return await sequelize.entity.Pessoa.findAll(where)
    }

}


module.exports = CedenteModel