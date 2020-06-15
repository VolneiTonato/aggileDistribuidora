const sequelize = require('./entityes/index')
const _ = require('lodash')
const enums = require('./enuns/enum')
const Op = sequelize.Sequelize.Op
const utilModel = require('../extras/utils-model')
const relation = require('./enuns/relation')
const utils = require('../../../helpers/_utils/utils')
const fs = require('fs')


let conexao = sequelize.sequelize

class ClienteModel {

    constructor() {
        this._model = sequelize.entity.Cliente

        process.nextTick(() => {
            this._pessoaModel = require('./pessoaModel')
        })
    }

    tiposEstabelecimento() {
        return enums.EnumTipoEstabelecimentoCliente
    }


    async pesquisar(conditions = {}) {

        let where = { }

        let query = {
            include: relation().RelationPessoa(['cliente']),
        }


        if(conditions.cnpj)
            where['$cliente.cnpj_cpf$'] = conditions.cnpj

        if (['ativo','inativo'].indexOf(_.get(conditions, 'status')) !== -1)
            where['$cliente.status$'] = conditions.status == 'ativo' ? true : false 

        


        if (conditions.clienteId > 0)
            where.clienteId = conditions.clienteId

        if (conditions.id > 0)
            where.id = conditions.id



        if (!where.clienteId && !where.id) {

            if (utils.ObjectUtil.getValueProperty(conditions, 'endereco.municipio.id') && !conditions.cnpj) {

                let clientes = await this.clientesByMunicipio(conditions.endereco.municipio.id)




                if (utils.ArrayUtil.length(clientes) == 0)
                    return []

                let ids = clientes.map((item) => { return item.id })

                where.id = { [Op.in]: ids }
            }


        }

        query.where = where


        if (conditions.paginator && ('limit' in conditions.paginator))
            query.limit = parseInt(conditions.paginator.limit)

        if (conditions.paginator && ('offset' in conditions.paginator))
            query.offset = parseInt(conditions.paginator.offset)


        return await sequelize.entity.Pessoa.findAll(query)
    }



    async findByAutoComplete(text = '') {



        let query = {
            where: { tipoPessoa: 'cliente' },
            include: _.clone(relation().RelationPessoa(['cliente'])),
        }

        if (utils.NumberUtil.isInt(text)) {
            query.where[Op.or] = [
                { id: utils.NumberUtil.cInt(text) },
                { clienteId: utils.NumberUtil.cInt(text) }
            ]

        } else {

            query.include = query.include.map(row => {

                if (row.as == 'cliente') {
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

    async clientesByMunicipio(municipioId) {

        let query = {
            include: relation().RelationPessoa(['cliente']),
        }



        query.include.filter(row => {

            if (row.as == 'enderecos')
                _.assign(row, { where: { municipioId: { [sequelize.Sequelize.Op.eq]: municipioId } }, separate: false, right: true, required: true })
        })


        return await sequelize.entity.Pessoa.findAll(query)




    }


    async update(data) {


        await this.uniqueRazaoSocialNomeFantasiaMunicipio(data).catch(err => { throw err })


        let clienteExistente = await  this._model.findByPk(data.cliente.id)

        if(!clienteExistente)
            throw 'Cliente inválido!'


        utilModel.LoadModelToFormUtil.loadChangeModel(clienteExistente, _.clone(data.cliente))


        await conexao.transaction(async (transaction) => {

            await new this._pessoaModel().update(data, { idParent: clienteExistente.id, tipoPessoa: 'cliente' }, { validate: true, transaction: transaction })

            await clienteExistente.save({ validate: true, transaction: transaction })

        })

        return await this.findOne({clienteId : clienteExistente.id})
    }

    async createOrUpdate(data) {

        if (!isNaN(parseInt(data.id)))
            return await this.update(data)
        else
            return await this.save(data)
    }

    async uniqueRazaoSocialNomeFantasiaMunicipio(data = {}) {

        let query = {
            where : {},
            include: relation().RelationPessoa(['cliente'])
        }


        query.include.filter((row) => {

            if (row.as == 'enderecos') {

                _.assign(row,
                    {
                        where: { municipioId: { [sequelize.Sequelize.Op.eq]: data.endereco.municipio.id } },
                        separate: false, required: true
                    }
                )
            }else if(row.as == 'cliente'){

                row.where = {
                    [Op.or]: {
                        razaoSocial: data.cliente.razaoSocial,
                        nomeFantasia: data.cliente.nomeFantasia
                    }
                }
            }
        })


        if (data.id)
            query.where.id = { [sequelize.Sequelize.Op.ne]: data.id }


        let clienteUnique = await sequelize.entity.Pessoa.findOne(query)
        

        if (clienteUnique)
            return Promise.reject(`Razão Social e/ou Nome fantasia já cadastrada para o município de ${clienteUnique.endereco.municipio.descricao}!`)
        return Promise.resolve()


    }

    async save(data) {



        let cliente = await conexao.transaction(async (transaction) => {

            await this.uniqueRazaoSocialNomeFantasiaMunicipio(data)
                .catch(err => {
                    throw err
                })

           
            let cliente = await this._model.create(data.cliente, { validate: true, transaction: transaction })

            

            await new this._pessoaModel().save(data, { idParent: cliente.id, tipoPessoa: 'cliente' }, { validate: true, transaction: transaction })


            return cliente

        })

        return await this.findOne({clienteId : cliente.id})


    }



    async findOne(conditions = {}) {


        let where = {
            include: relation().RelationPessoa(['cliente']),
            where: conditions
        }

        return await sequelize.entity.Pessoa.findOne(where)
    }

    async findAll(conditions) {

        let where = {
            include: relation().RelationPessoa(['cliente'])
        }

        if (conditions) {

            where = {
                where: conditions
            }
        }

        return await sequelize.entity.Pessoa.findAll(where)
    }


}


module.exports = ClienteModel