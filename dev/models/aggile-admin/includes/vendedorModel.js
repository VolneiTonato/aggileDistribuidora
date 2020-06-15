const sequelize = require('./entityes/index')
const _ = require('lodash')
const enums = require('./enuns/enum')
const Op = sequelize.Sequelize.Op
const utilModel = require('../extras/utils-model')
const relation = require('./enuns/relation')
const utils = require('../../../helpers/_utils/utils')


let conexao = sequelize.conexao

class VendedorModel {

    constructor() {
        this._model = sequelize.entity.Vendedor

        process.nextTick(() => {
            this._pessoaModel = require('./pessoaModel')
            this._usuarioModel = require('./usuarioModel')
        })        

    }


    async pesquisar(conditions = {}) {

        let where = {}

        let query = {
            include: relation().RelationPessoa(['vendedor']),
        }


        query.include.filter(row => {

            if (row.as == 'vendedor') {

                let whereInner = {}

                if (conditions.cnpj)
                    whereInner.cnpjCpf = conditions.cnpj

                if (utils.ObjectUtil.getValueProperty(conditions, 'status') !== '')
                    whereInner.status = utils.StringUtil.stringToBool(conditions.status)

                row.where = whereInner
            }
        })



        if (conditions.vendedorId > 0)
            where.vendedorId = conditions.vendedorId

        if (conditions.id > 0)
            where.id = conditions.id



        if (!where.vendedorId && !where.id) {

            if (utils.ObjectUtil.getValueProperty(conditions, 'endereco.municipio.id') && !conditions.cnpj) {

                let vendedores = await this.vendedoresByMunicipio(conditions.endereco.municipio.id)




                if (utils.ArrayUtil.length(vendedores) == 0)
                    return []

                let ids = vendedores.map((item) => { return item.id })

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
            where: { tipoPessoa: 'vendedor' },
            include: _.clone(relation().RelationPessoa(['vendedor'])),
        }

        if (utils.NumberUtil.isInt(text)) {
            query.where[Op.or] = [
                { id: utils.NumberUtil.cInt(text) },
                { vendedorId: utils.NumberUtil.cInt(text) }
            ]

        } else {

            query.include = query.include.map(row => {

                if (row.as == 'vendedor') {
                    row.where = {

                        [Op.or]: [
                            { nomeCompleto: { [Op.like]: `%${text}%` } },
                            { cnpjCpf: { [Op.like]: `%${text}%` } }
                        ]
                    }

                    row.required = true
                }

                return row
            })
        }

        return await sequelize.entity.Pessoa.findAll(query)

    }




    async vendedoresByMunicipio(municipioId) {

        let query = {
            include: relation().RelationPessoa(['vendedor']),
        }



        query.include.filter(row => {

            if (row.as == 'enderecos')
                _.assign(row, { where: { municipioId: { [sequelize.Sequelize.Op.eq]: municipioId } }, separate: false, right: true, required: true })
        })


        return await sequelize.entity.Pessoa.findAll(query)
    }


    async update(data) {

        let vendedorExistente = await  this._model.findByPk(data.vendedor.id)

        if(!vendedorExistente)
            throw 'Vendedor inválido!'


        utilModel.LoadModelToFormUtil.loadChangeModel(vendedorExistente, _.clone(data.vendedor))


        await conexao.transaction(async (transaction) => {

            await new this._pessoaModel().update(data, { idParent: vendedorExistente.id, tipoPessoa: 'vendedor' }, { validate: true, transaction: transaction })

            await vendedorExistente.save({ validate: true, transaction: transaction })

        })

        return await this.findOne({vendedorId : vendedorExistente.id})
    }


    async createOrUpdate(data) {

        if (!isNaN(parseInt(data.id)))
            return await this.update(data)
        else
            return await this.save(data)
    }


    async save(data) {



        let transactionOperation = await conexao.transaction(async (transaction) => {

            

            let usuario = await new this._usuarioModel().newUserRamdon(data.vendedor.nomeCompleto, ['vendedor'], { validate: true, transaction: transaction })


            



            data.vendedor.usuarioId = usuario.id
           
            let vendedor = await this._model.create(data.vendedor, { validate: true, transaction: transaction })

            

            await new this._pessoaModel().save(data, { idParent: vendedor.id, tipoPessoa: 'vendedor' }, { validate: true, transaction: transaction })


            let newUser = {
                login : usuario.login,
                passwordTextplain: usuario.passwordTextplain
            }

            
            return {newUser : newUser, vendedor : vendedor}

        })

        let retorno  = await this.findOne({vendedorId : transactionOperation.vendedor.id})


        return {newUser : transactionOperation.newUser, vendedor: retorno}

    }



    async findOne(conditions = {}) {


        let where = {
            include: relation().RelationPessoa(['vendedor']),
            where: conditions
        }

        return await sequelize.entity.Pessoa.findOne(where)
    }

    async findAll(conditions) {

        let where = {
            include: relation().RelationPessoa(['vendedor'])
        }

        if (conditions) {

            where = {
                where: conditions
            }
        }

        return await sequelize.entity.Pessoa.findAll(where)
    }


}


module.exports = VendedorModel