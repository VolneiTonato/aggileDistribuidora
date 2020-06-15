const sequelize = require('./entityes/index')
const _ = require('lodash')
const utils = require('../../../helpers/_utils/utils')
const utilModel = require('../extras/utils-model')
const relation = require('./enuns/relation')
const Op = sequelize.Sequelize.Op
const enuns = require('./enuns/enum')

let conexao = sequelize.conexao



module.exports  = class PedidoClienteModel {

    constructor() {


        this._model = sequelize.entity.PedidoCliente

        process.nextTick(() => {
            this._modelCliente = require('./clienteModel')
            this._modelMovimentacao = require('./movimentacaoModel')
            this._modelRecebimento = require('./recebimentoModel')
            this._itemPedidoCliente = require('./itemPedidoClienteModel')

        })
    }

    async findOne(conditions) {
        let where = {
            include: relation().RelationPedido.Pedido,
            where: conditions
        }

        return await this._model.findOne(where)
    }

    async pesquisar(conditions) {

        let where = {}

        let query = {}



        query.include = relation().RelationPedido.Pedido

        if (utils.ObjectUtil.getValueProperty(conditions, 'id') > 0)
            where.id = conditions.id 

        if (_.get(conditions, 'uuid'))
            where.uuid = conditions.uuid

        let conditionDataBettowen = undefined

        if (conditions.dataInicial && conditions.dataFinal) {

            conditions.dataInicial = `${utils.DateUtil.betweenFormatQuery(conditions.dataInicial)}`
            conditions.dataFinal = `${utils.DateUtil.betweenFormatQuery(conditions.dataFinal, false)}`

            conditionDataBettowen = { [Op.gte]: conditions.dataInicial, [Op.lte]: conditions.dataFinal }

            if (['dataEntrega', 'dataPedido'].indexOf(conditions.dataFiltro) !== -1) {

                if (conditions.dataFiltro == 'dataEntrega')
                    where.dataEntrega = conditionDataBettowen
                else
                    where.createdAt = conditionDataBettowen

            }


        }

        if (utils.ObjectUtil.getValueProperty(conditions, 'consignado'))
            where.consignado = utils.StringUtil.stringToBool(conditions.consignado)

        if (utils.ObjectUtil.getValueProperty(conditions, 'clienteId'))
            _.assign(where, { clienteId: conditions.clienteId })

        let mostrarContasAReceber = utils.StringUtil.stringToBool(conditions.mostrarReceitas)

        if (mostrarContasAReceber === true) {

            query.include.push(relation().RelationPedido.Recebimento[0])

            if (enuns.EnumStatusRecebimento.map((item => { return item.value })).indexOf(utils.ObjectUtil.getValueProperty(conditions, 'statusReceita')) !== -1) {

                query.include.filter(item => {
                    if (item.as == 'recebimento') {

                        item.where = {}

                        if (conditions.status !== '') {
                            item.where.status = conditions.statusReceita

                            item.required = true
                            item.separate = false
                        }
                    }
                })



            }
        }

        if (utils.ObjectUtil.getValueProperty(conditions, 'municipio') && !utils.ObjectUtil.getValueProperty(conditions, 'clienteId')) {
            let clientes = await new this._modelCliente().clientesByMunicipio(conditions.municipio)



            if (clientes) {
                let ids = clientes.map((item) => { return item.id })

                _.assign(where, { clienteId: { [Op.in]: ids } })
            }
        }


        if (utils.ObjectUtil.getValueProperty(conditions, 'fabricaId')) {

            query.include.filter(item => {
                if (item.as == 'itens') {
                    item.include.filter(r => {
                        if (r.as == 'produto') {
                            _.assign(r, {
                                where: { fabricaId: conditions.fabricaId },
                                required: true,
                                separate: false
                            })
                        }
                    })

                }
            })

        }

        if (utils.ObjectUtil.getValueProperty(conditions, 'produtoId')) {
            query.include.filter(item => {
                if (item.as == 'itens') {
                    item.include.filter(r => {
                        if (r.as == 'produto') {
                            _.assign(r, {
                                where: { id: conditions.produtoId },
                                required: true,
                                separate: false
                            })
                        }
                    })
                }
            })
        }


        if (conditions.status && conditions.status != 'all')
            _.assign(where, { status: conditions.status })
        else if (conditions.status !== 'all' && Object.getOwnPropertyNames(where).length == 0 && [undefined, false].indexOf(conditions.forceReturn) !== - 1)
            return []






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
            include: relation().RelationPedido.pedido,
            where: conditions,
            order: [orderby]
        }

        return await this._model.findAll(where)
    }


    async cancelarPedido(data = {}) {




        await this._model.findOne({
            where: { id: data.id }
        }).then(async (r) => {


            if (data.isEstorno == true && r.status !== 'lancado')
                throw 'Não é possível estornar esse pedido!'


            if (r.status == 'pendente') {

                let pedidoMovimentacao = await new this._modelMovimentacao()._model.findOne({ where: { pedidoClienteId: data.id } })

                if (pedidoMovimentacao) {
                    r.status = 'cancelado'
                    return await this.createOrUpdate(r)
                }

                await new this._itemPedidoCliente().removeItemPedido({ numero: data.id, removeAll: true })

                this._model.destroy({
                    where: { id: data.id }
                }).then((r) => {
                    return true
                }).catch((err) => {
                    throw err
                })
            } else if (data.isEstorno == 'true' && r.status == 'lancado') {

                r.status = 'pendente'
                return await this.createOrUpdate(r, true)

            } else if (data.isEstorno == 'true' && r.status == 'cancelado') {

                r.status = 'pendente'
                return await this.createOrUpdate(r, false)

            } else {
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

        if (enuns.EnumStatusPedido.map(item => { return item.value }).indexOf(data.status) === -1)
            throw "Status inválido!"





        if (!data.id && ['lancado', 'entregue'].indexOf(data.status) !== -1)
            throw 'Ocorreu um erro ao salvar pedido. Recarregue a pagina e tente novamente.'



        if (data.id) {


            let resolve = await conexao.transaction(async (transaction) => {


                let pedido = utilModel.LoadModelToFormUtil.loadChangeModel(new sequelize.entity.PedidoCliente(), _.clone(data))

                let pedidoExistente = await this._model.findByPk(pedido.id, {
                    include: relation().RelationPedido.ItemPedido
                })

                if (!pedidoExistente)
                    throw 'Pedido Inválido!'


                let statusAtual = pedidoExistente.status
                pedidoExistente.total = 0.00
                pedidoExistente.totalItens = 0


                if (pedidoExistente && (pedidoExistente.itens)) {
                    _.each(pedidoExistente.itens, (item) => {
                        pedidoExistente.total += parseFloat(item.total)
                        pedidoExistente.totalItens += parseInt(item.quantidade)
                    })
                }

                utilModel.LoadModelToFormUtil.setData(pedidoExistente, pedido, ['dataEntrega', 'status', 'observacao', 'isNF', 'consignado'])


                if (pedidoExistente.status == 'entregue' && pedidoExistente.consignado === true)
                    throw 'Não é possível marcar como entregue quando o pedido está consignado!'


                if ('pedidoIsConsignado' in data)
                    pedidoExistente.consignado = utils.StringUtil.stringToBool(data.pedidoIsConsignado)



                


                await pedidoExistente.save({ validate: true, transaction: transaction })



                if (pedidoExistente.status == 'lancado') {


                    if (pedidoExistente.itens) {


                        if (statusAtual !== pedidoExistente.status) {

                            await new this._modelMovimentacao().registrarSaidaPedido(pedidoExistente, pedidoExistente.itens, { validate: true, transaction: transaction })

                            await new this._modelRecebimento().registrarContaAReceberPedido(pedidoExistente, { validate: true, transaction: transaction })

                        }

                        return { lancamento: true }

                    }
                } else if (pedidoExistente.status == 'cancelado') {

                    await new this._modelMovimentacao().cancelarSaidaPedido(pedidoExistente, pedidoExistente.itens, { validate: true, transaction: transaction })

                    await new this._modelRecebimento().cancelarRecebimentoByPedido(pedidoExistente, { validate: true, transaction: transaction })

                    return await pedidoExistente

                } else if (pedidoExistente.status == 'pendente' && isEstorno == true) {


                    await new this._modelMovimentacao().estornarSaidaPedido(pedidoExistente, pedidoExistente.itens, { validate: true, transaction: transaction })

                    await new this._modelRecebimento().cancelarRecebimentoByPedido(pedidoExistente, { validate: true, transaction: transaction })

                    return await pedidoExistente
                }

            })

            return resolve

        } else {

            return await (utilModel.LoadModelToFormUtil.loadChangeModel(new sequelize.entity.PedidoCliente(), data)).save({ validate: true })

            //            return await this._model.create(data, { validate: true })
        }
    }
}