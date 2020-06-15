const sequelize = require('./entityes/index')
const _ = require('lodash')
const enums = require('./enuns/enum')
const Op = sequelize.Sequelize.Op
const utilModel = require('../extras/utils-model')
const relation = require('./enuns/relation')
const utils = require('../../../helpers/_utils/utils')
const fs = require("fs")


let conexao = sequelize.sequelize

class ContaBancariaModel {

    constructor() {
        this._model = sequelize.entity.ContaBancaria

        process.nextTick(() => {
            this._telefoneModel = require('./telefoneModel')
        })
    }


    async pesquisar(conditions = {}) {

        let where = {}

        let query = {
            include: relation().RelationContaBancaria
        }




        if (conditions.id > 0) {
            where.id = conditions.id
        } else {


            if (conditions.cnpj)
                where.cnpjCpf = conditions.cnpj



            if (utils.ObjectUtil.getValueProperty(conditions, 'status') !== '')
                where.status = utils.StringUtil.stringToBool(conditions.status)

            if (conditions.pessoaId)
                where.pessoaId = conditions.pessoaId

            if (conditions.agenciaId)
                where.agenciaId = conditions.agenciaId

            if (conditions.bancoId) {
                query.include.filter(item => {
                    if (item.as == 'agencia') {
                        item.include.filter(row => {
                            if (row.as == 'banco')
                                row.where = { id: conditions.bancoId }
                        })
                    }
                })
            }
        }


        if (Object.getOwnPropertyNames(where).length > 0)
            query.where = where




        if (conditions.paginator && ('limit' in conditions.paginator))
            query.limit = parseInt(conditions.paginator.limit)

        if (conditions.paginator && ('offset' in conditions.paginator))
            query.offset = parseInt(conditions.paginator.offset)




        return await this._model.findAll(query)
    }



    async findByAutoComplete(text = '') {


        let query = {

            where: {
                [Op.or]: [
                    { titular: { [Op.like]: `%${text}%` } },
                    { cnpjCpf: { [Op.like]: `%${text}%` } },
                    { numero: { [Op.eq]: utils.NumberUtil.cdbl(text) } },
                    { '$pessoaAgencia.agencia.nome$' : { [Op.like]: `%${text}%` }},
                    { '$pessoaAgencia.agencia.numero$' : { [Op.eq]: utils.NumberUtil.cdbl(text) }},
                    { '$pessoaAgencia.agencia.banco.descricao$' : { [Op.like]: `%${text}%` }},
                    { '$pessoa.vendedor.nome_completo$' : { [Op.like]: `%${text}%` }}
                ]
            },

            include: relation().RelationContaBancaria
        }

        _.each(['cliente','fabrica','cedente'], table => {
            query.where[Op.or].push({[`$pessoa.${table}.nome_fantasia$`] : {[Op.like] : `%${text}%`}})
            query.where[Op.or].push({[`$pessoa.${table}.razao_social$`] : {[Op.like] : `%${text}%`}})
        })


        return await this._model.findAll(query)

    }



    async update(data) {


        await this.uniqueContaToAgencia(data).catch(err => { throw err })



        let contaExistente = await this.findOne(data.id)

        utilModel.LoadModelToFormUtil.loadChangeModel(contaExistente, _.clone(data))


        await conexao.transaction(async (transaction) => {


            if (contaExistente.tipoCadastro == 'sem-associacao')
                await new this._telefoneModel().saveTelefones(data.id, data.telefones, 'conta-bancaria', { validate: true, transaction: transaction })


            await contaExistente.save({ validate: true, transaction: transaction })

            

        })

        return await this.findOne(contaExistente.id)
    }

    async createOrUpdate(data) {

        if (!isNaN(parseInt(data.id)))
            return await this.update(data)
        else
            return await this.save(data)
    }

    async uniqueContaToAgencia(data = {}) {

        


        let query = {
            //include: relation().RelationContaBancaria,
            where: {
                dv: data.dv,
                numero: data.numero,
                pessoaAgenciaId: data.pessoaAgenciaId
            },

        }

        if (data.id)
            _.assign(query.where, { id: { [sequelize.Sequelize.Op.ne]: data.id } })


        let contaUnique = await this._model.findOne(query, { raw: true })


        if (contaUnique)
            return Promise.reject(`Número/Agência já cadastrada!`)


        return Promise.resolve()
    }

    async save(data) {

        let contaBancaria = await conexao.transaction(async (transaction) => {


            await this.uniqueContaToAgencia(data)
                .catch(err => {
                    throw err
                })



            let contaBancaria = this._model.build(data)



            _.unset(data, 'id')

            contaBancaria = await this._model.create(data, { validate: true, transaction: transaction })


            if (contaBancaria.tipoCadastro == 'sem-associacao')
                await new this._telefoneModel().saveTelefones(contaBancaria.id, data.telefones, 'conta-bancaria', { validate: true, transaction: transaction })


            return contaBancaria

        })

        return await this.findOne(contaBancaria.id)


    }



    async findOne(id) {

        let where = {
            include: relation().RelationContaBancaria,
            where: { id: { [sequelize.Sequelize.Op.eq]: id } }
        }

        return await this._model.findOne(where)
    }

    async findAll(conditions) {

        let where = {
            include: relation().RelationContaBancaria
        }

        if (conditions)
            where.where = conditions

        return await this._model.findAll(where)
    }


}


module.exports = ContaBancariaModel