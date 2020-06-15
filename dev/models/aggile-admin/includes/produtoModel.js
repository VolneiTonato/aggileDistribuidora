const sequelize = require('./entityes/index')
const _ = require('lodash')
const async = require('async')
const utilModel = require('../extras/utils-model')
const relation = require('./enuns/relation')
const Op = sequelize.Sequelize.Op
const utils = require('../../../helpers/_utils/utils')

let conexao = sequelize.conexao


class ProdutoModel {

    constructor() {

        this._model = sequelize.entity.Produto

        process.nextTick(() => {
            this._modelProdutoEcommerce = require('./ProdutoEcommerceModel')
        })



    }

    async findByAutoComplete(text = '') {


        let query = {
            include: relation().RelationProduto,
            where: {

                [Op.or]: [
                    { descricao: { [Op.like]: `%${text}%` } },
                    { referencia: { [Op.eq]: text } },
                    { '$grupo.bread_crumb$': { [Op.like]: `%${text}%` } }
                ]

            }
        }

        return await this._model.findAll(query)

    }

    async produtosByFabrica(fabricaId = 1) {

        let query = {
            include : relation().RelationProduto,
            where: {fabricaId : fabricaId}
        }

        return await this._model.findAll(query)
    }

    async saveToEcommece(data){
        
        let produto = await this.findOne({id : data.id})

        
        if(!produto)
            throw 'Produto inválido!'

        return await conexao.transaction(async (transaction) => {
            
            let prdEcommerce = await new this._modelProdutoEcommerce().saveToProduto(data, {validate: true, transaction : transaction})

            produto.produtoEcommerceId = prdEcommerce.id

            await produto.save({validate: true, transaction : transaction})
        })
    }


    async findAllToEcommerce(){
        let query = {
            include: relation().RelationProduto
        }

        query.include.filter((item) => {
            if (item.as == 'produtoEcommerce'){
                item.where =  { isEcommerce: true }
                item.required = true
            }
        })        

        return await this._model.findAll(query) 
    }

    async uniqueDescricao(data = {}) {

        let produtoUnique = await utilModel.CrudUtil.uniqueField(this._model, data.id, {descricao : data.descricao })

        if (produtoUnique)
            return Promise.reject('Descrição já cadastrada!')
        return Promise.resolve()

    }


    async createOrUpdate(data) {

        let produto = {}


        await this.uniqueDescricao(data).catch(err => {throw err})


        let uniqueProduto = await this.uniqueReferenciaByFabrica(data)

        if (uniqueProduto)
            throw `Já existe um produto cadastrado com a referência ${uniqueProduto.referencia} e com a mesma fábrica!`

        if (data.id) {

            produto = utilModel.LoadModelToFormUtil.load(new sequelize.entity.Produto(), data)

            let produtoExistente = await this._model.findOne({ where: { id: produto.id } })

            if (!produtoExistente)
                throw 'Produto inválido'

            utilModel.LoadModelToFormUtil.setData(produtoExistente, produto, [
                'descricao',
                'custo', 'precoVenda', 'comissao', 'margemLucro',
                'peso', 'altura', 'largura', 'comprimento', 'referencia',
                'unidadePorEmbalagem', 'graduacaoAlcoolica',
                'grupoId', 'fabricaId', 'volumeId', 'tipoUnidadeId', 'fracao', 'status'

            ])

            produto = await produtoExistente.save({ validate: true })


        } else {
            produto = await this._model.create(data, { validate: true })
        }

        return await this.findOne({ id: produto.id })
    }

    async uniqueReferenciaByFabrica(param = {}) {

        let where = { referencia: param.referencia, fabricaId: param.fabricaId }

        if (param.id)
            _.assign(where, { id: { [Op.ne]: param.id } })

        return await this._model.findOne({ where: where })


    }


    async findOne(conditions) {


        let where = {
            include: relation().RelationProduto,
            where: conditions
        }


        return await this._model.findOne(where)
    }

    async pesquisar(conditions = {}) {

        let where = {}

        if (conditions.fabricaId)
            _.assign(where, { fabricaId: conditions.fabricaId })

        if (conditions.grupoId)
            _.assign(where, { grupoId: conditions.grupoId })

        if (conditions.referencia)
            _.assign(where, { referencia: conditions.referencia })

        if (conditions.id)
            _.assign(where, { id: conditions.id })
        
        if(utils.ObjectUtil.getValueProperty(conditions, 'status') != '')
            where.status = utils.StringUtil.stringToBool(conditions.status)

        let query = {include: relation().RelationProduto, where: where }

        if (conditions.paginator && ('limit' in conditions.paginator))
            query.limit = parseInt(conditions.paginator.limit)

        if (conditions.paginator && ('offset' in conditions.paginator))
            query.offset = parseInt(conditions.paginator.offset)


        return await this._model.findAll(query)
    }

    async findAll(conditions = {}) {

        let where = {
            include: [{all: true, nested: true}],
            where: conditions
        }

        return await this._model.findAll(where)
    }

}


module.exports = ProdutoModel