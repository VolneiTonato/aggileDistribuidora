const sequelize = require('./entityes/index')
const utilModel = require('../extras/utils-model')
const utils = require('../../../helpers/_utils/utils')
const relacao = require('./enuns/relation')


let conexao = sequelize.conexao


class InventarioModel {

    constructor() {
        this._model = sequelize.entity.Inventario

        process.nextTick(() => {
            this._modelMovimentacao = require('./movimentacaoModel')
        })
    }

    async findAll(conditions = {}){

        let where = {
            include : relacao().RelationItemToProduto,
            where : conditions
        }


        

        return await this._model.findAll(where)

    }

    async findOne(conditions = {}, options = {}){

        let where = {            
            include : relacao().RelationItemToProduto,
            where : conditions
        }

        return await this._model.findOne(where, options)

    }



    async pesquisar(conditions = {}) {
     

        

        let query = {
            include : relacao().RelationItemToProduto
        }

        let where = {}

        if (conditions.dataInicial && conditions.dataFinal) {

            conditions.dataInicial = utils.DateUtil.betweenFormatQuery(conditions.dataInicial)
            conditions.dataFinal = utils.DateUtil.betweenFormatQuery(conditions.dataFinal, false)

            where.createdAt = { ['$between']: [conditions.dataInicial, conditions.dataFinal] }

        }

        if(conditions.operacao)
            where.operacao = conditions.operacao


        query.where = where
    

        
        if (utils.ObjectUtil.getValueProperty(conditions,'paginator.limit'))
            query.limit = parseInt(conditions.paginator.limit)

        if (utils.ObjectUtil.getValueProperty(conditions,'paginator.offset'))
            query.offset = parseInt(conditions.paginator.offset)
            

        return await this._model.findAll(query)
    }

    

    async createOrUpdate(data){

        

        let inventario = utilModel.LoadModelToFormUtil.loadChangeModel(new sequelize.entity.Inventario(), data)


        return await conexao.transaction(async (transaction) => {

            

            let inventarioModel = await this._model.create(inventario.dataValues, { validate: true, transaction: transaction })
            
            
            await new this._modelMovimentacao().registrarInventario(inventarioModel , {validate : true, transaction : transaction})          


        })

    }
}


module.exports = InventarioModel