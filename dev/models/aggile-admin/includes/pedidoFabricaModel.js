const sequelize = require('./entityes/index')
const _ = require('lodash')
const utils = require('../../../helpers/_utils/utils')
const utilModel = require('../extras/utils-model')
const relation = require('./enuns/relation')
const Op = sequelize.Sequelize.Op

let conexao = sequelize.conexao



module.exports = class PedidoFabricaModel {

    constructor() {
        this._model = sequelize.entity.PedidoFabrica
        process.nextTick(() => {
            this._notaEntradaModel = require('./notaEntradaModel')
            this._itemPedidoFabricaModel = require('./itemPedidoFabricaModel')
        })
    }

    async findOne(conditions) {
        let where = {
            include : relation().RelationPedidoFabrica.Pedido,
            where: conditions
        }

        return await this._model.findOne(where)
    }

    async pesquisar(conditions) {

        let where = { }

        let query = {
            include: relation().RelationPedidoFabrica.Pedido
        }


        if (utils.ObjectUtil.getValueProperty(conditions, 'id') > 0) {
            _.assign(where, { id: conditions.id })

        } else {
            if (conditions.dataInicial && conditions.dataFinal) {

                conditions.dataInicial = `${utils.DateUtil.betweenFormatQuery(conditions.dataInicial)}`
                conditions.dataFinal = `${utils.DateUtil.betweenFormatQuery(conditions.dataFinal, false)}`

                let testData = { [Op.gte]: conditions.dataInicial, [Op.lte]: conditions.dataFinal }

                if (conditions.dataFiltro == 'dataEntrega')
                    where.dataEntrega = testData
                else
                    where.createdAt = testData
            }

            if (utils.ObjectUtil.getValueProperty(conditions, 'consignado'))
                where.consignado = utils.StringUtil.stringToBool(conditions.consignado)

            if (utils.ObjectUtil.getValueProperty(conditions, 'fabricaId'))
                _.assign(where, { fabricaId: conditions.fabricaId })


            if(utils.ObjectUtil.getValueProperty(conditions, 'produtoId')){
                query.include.filter(item => {
                    if(item.as  == 'itens'){
                        item.include.filter(r => {
                            if(r.as == 'produto'){
                                r.where = {id : conditions.produtoId}
                                r.required = true
                            }
                        })
                    }
                })
            }


            if (conditions.status && conditions.status != 'all')
                _.assign(where, { status: conditions.status })
            else if (conditions.status !== 'all' && Object.getOwnPropertyNames(where).length == 0 && [undefined, false].indexOf(conditions.forceReturn) !== - 1)
                return []

        }

        query.where = where

        if (conditions.paginator && ('limit' in conditions.paginator))
            query.limit = parseInt(conditions.paginator.limit)

        if (conditions.paginator && ('offset' in conditions.paginator))
            query.offset = parseInt(conditions.paginator.offset)

        let data = await this._model.findAndCountAll(query)

        return data.rows




    }


    async findAll(conditions, orderby = ['dataEntrega', 'DESC']) {
        let where = {
            where: conditions,
            order: [orderby],
            include : relation().RelationPedidoFabrica.Pedido
        }

        return await this._model.findAll(where)
    }


    async cancelarPedido(data = {}) {




        await this._model.findOne({
            where: { id: data.id }
        }).then(async (r) => {


            if (data.isEstorno == true && r.status === 'lancado')
                throw 'Não é possível estornar esse pedido!'


            if (r.status == 'pendente') {

                await new this._itemPedidoFabricaModel().removeItemPedido({ numero: data.id, removeAll: true })

                this._model.destroy({
                    where: { id: data.id }
                }).then((r) => {
                    return true
                }).catch((err) => {
                    throw err
                })
            /*} else if (data.isEstorno == 'true' && r.status == 'lancado') {

                r.status = 'pendente'
                return await this.createOrUpdate(r, true)

            } else if (data.isEstorno == 'true' && r.status == 'cancelado') {

                r.status = 'pendente'
                return await this.createOrUpdate(r, false)

            */} else {
                r.status = 'cancelado'
                return await this.createOrUpdate(r)
            }

        }).catch((err) => {
            throw err
        })
    }





    async createOrUpdate(data = {}, isEstorno = false) {


        if (!data.status)
            throw "status obrigatório!"


        if (!data.id && ['lancado'].indexOf(data.status) !== -1)
            throw 'Ocorreu um erro ao salvar pedido. Recarregue a pagina e tente novamente.'



        if (data.id) {


            let resolve = await conexao.transaction(async (transaction) => {


                let pedido = utilModel.LoadModelToFormUtil.loadChangeModel(new sequelize.entity.PedidoFabrica(), _.clone(data))

                let pedidoExistente = await this._model.findByPk(pedido.id, {
                    include: relation().RelationPedidoFabrica.ItemPedido
                })

                if (!pedidoExistente)
                    throw 'Pedido Inválido!'


                pedidoExistente.total = 0.00
                pedidoExistente.totalItens = 0
                pedidoExistente.pesoTotal = 0


                if (pedidoExistente && (pedidoExistente.itens)) {
                    _.each(pedidoExistente.itens, (item ) => {
                        pedidoExistente.total += parseFloat(item.total)
                        pedidoExistente.totalItens += parseInt(item.quantidade)
                        pedidoExistente.pesoTotal = utils.NumberUtil.sum(pedidoExistente.pesoTotal,  item.peso)

                    })
                }

                utilModel.LoadModelToFormUtil.setData(pedidoExistente, pedido, ['dataEntrega', 'status', 'observacao', 'isNF'])



                await pedidoExistente.save({ validate: true, transaction: transaction })

                if(pedidoExistente.status == 'lancado')
                    await new this._notaEntradaModel().registrarNotaByPedidoFabrica(pedidoExistente, { validate: true, transaction: transaction })
                
            })

            return resolve

        } else {

            let pedido = await (utilModel.LoadModelToFormUtil.loadChangeModel(new sequelize.entity.PedidoFabrica(), data)).save({ validate: true })

            return this.findOne({id : pedido.id})
        }
    }
}