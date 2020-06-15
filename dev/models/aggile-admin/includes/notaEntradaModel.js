const sequelize = require('./entityes/index')
const _ = require('lodash')
const utils = require('../../../helpers/_utils/utils')
const utilModel = require('../extras/utils-model')
const Op = sequelize.Sequelize.Op
const relation = require('./enuns/relation')

let conexao = sequelize.conexao

module.exports = class NotaEntradaModel {

    constructor() {


        this._model = sequelize.entity.NotaEntrada

        process.nextTick(() => {
            this._modelMovimentacao = require('./movimentacaoModel')
            this._modelDespesa = require('./despesaModel')
            this._pessoaModel = require('./pessoaModel')
            this._itemEntradaNotaModel = require('./itemEntradaNotaModel')
        })
    }



    async pesquisar(conditions) {

        let where = {}

        if (utils.ObjectUtil.getValueProperty(conditions, 'id') > 0) {
            where = { id: conditions.id }

        } else {

            if (conditions.dataInicial && conditions.dataFinal) {

                conditions.dataInicial = utils.DateUtil.betweenFormatQuery(conditions.dataInicial)
                conditions.dataFinal = utils.DateUtil.betweenFormatQuery(conditions.dataFinal, false)

                where.data = { [Op.gte]: conditions.dataInicial, [Op.lte]: conditions.dataFinal }
            }

            if (conditions.fabricaId)
                where.fabricaId = conditions.fabricaId


            if (utils.ObjectUtil.getValueProperty(conditions, 'numero'))
                where.numero = conditions.numero


            if (conditions.status && conditions.status != 'all')
                where.status = conditions.status
            else if (conditions.status !== 'all' && Object.getOwnPropertyNames(where).length == 0)
                return []

        }


        let query = {include: relation().RelationNotaEntrada.Nota, where: where }

        if (utils.ObjectUtil.getValueProperty(conditions, 'paginator.limit'))
            query.limit = parseInt(conditions.paginator.limit)

        if (utils.ObjectUtil.getValueProperty(conditions, 'paginator.offset'))
            query.offset = parseInt(conditions.paginator.offset)

        return await this._model.findAll(query)

        

    }


    async findOne(conditions) {
        let where = {
            include: relation().RelationNotaEntrada.Nota,
            where: conditions
        }

        return await this._model.findOne(where)
    }


    async findAll(conditions) {
        let where = {
            include: relation().RelationNotaEntrada.Nota,
            where: conditions
        }

        return await this._model.findAll(where)
    }


    async registrarNotaByPedidoFabrica(pedido, options){
        let nota = {
            status: 'pendente',
            data: new Date(),
            total: pedido.total,
            totalItens: pedido.totalItens,
            fabricaId: pedido.fabricaId,
            usuarioId: pedido.usuarioId
        }

        let notaSave = utilModel.LoadModelToFormUtil.load(new sequelize.entity.NotaEntrada(), nota)

        await notaSave.save(options)

        for(let item of pedido.itens){
            
            let itemEntrada = {
                custo: item.custo,
                total: item.total,
                quantidade: item.quantidade,
                isBonificado: item.isBonificado,
                tipoUnidade: item.tipoUnidade,
                produtoId: item.produtoId,
                notaEntradaId: notaSave.id
            }

            let itemSave = utilModel.LoadModelToFormUtil.load(new sequelize.entity.ItemEntrada(), itemEntrada)

            await itemSave.save(options)
        }

        return true
    }


    async cancelarNotaFiscal(data) {


        await this._model.findOne({
            where: { id: data.id }
        }).then(async (r) => {

            if (r.status == 'pendente') {

                await new this._itemEntradaNotaModel().removeItemNota({ nf: r.id, removeAll: true })

                this._model.destroy({
                    where: { id: data.id }
                }).then((r) => {
                    return true
                }).catch((err) => {
                    throw err
                })
            } else if (r.status == 'lancada' && data.isEstorno == 'true') {
                r.status = 'pendente'
                return await this.createOrUpdate(r, true)

            } else if (r.status == 'cancelada' && data.isEstorno == 'true') {
                r.status = 'pendente'
                return await this.createOrUpdate(r, false)
            } else {
                r.status = 'cancelada'
                return await this.createOrUpdate(r)
            }
        }).catch((err) => {
            throw err
        })
    }


    async isFabricaById(id){
        let exists = await new this._pessoaModel()._model.findOne({
            where : { tipoPessoa: 'fabrica', fabricaId: id }
        })

        return exists !== undefined
    }





    async createOrUpdate(data, isEstorno = false) {
        
        if (!data.status)
            throw "status obrigatório!"

        if(!await this.isFabricaById(data.fabricaId))
            throw 'Fábrica inválida!'


        let notaEntrada = utilModel.LoadModelToFormUtil.loadChangeModel(new sequelize.entity.NotaEntrada(), _.clone(data))
  
        if (!data.id)
            return await notaEntrada.save({ validate: true })

        let resolve = await conexao.transaction(async (transaction) => {


            let notaEntradaExistente = await this._model.findByPk(notaEntrada.id, {
                include: relation().RelationNotaEntrada.ItemNota
            })

            if (!notaEntradaExistente)
                throw 'Nota Fiscal Inválida!'

            if (notaEntrada.status == 'finalizada' && notaEntradaExistente.status == 'finalizada')
                throw 'Nota Fiscal já finalizada'


            notaEntradaExistente.total = 0.00
            notaEntradaExistente.totalItens = 0



            if (notaEntradaExistente && (notaEntradaExistente.itens)) {
                _.each(notaEntradaExistente.itens, (item) => {
                    notaEntradaExistente.total = utils.NumberUtil.sum(notaEntradaExistente.total, item.total)
                    notaEntradaExistente.totalItens = utils.NumberUtil.sum(notaEntradaExistente.totalItens, item.quantidade)
                })
            }



            utilModel.LoadModelToFormUtil.setData(notaEntradaExistente, notaEntrada, ['numero', 'data', 'chaveAcessoNF', 'status'])

            
            await notaEntradaExistente.save({ validate: true, transaction: transaction })



            if (notaEntradaExistente.status == 'lancada') {


                if (notaEntradaExistente.itens) {

                    await new this._modelMovimentacao().registrarEntradaNota(notaEntradaExistente, notaEntradaExistente.itens, { validate: true, transaction: transaction })

                    await new this._modelDespesa().registrarContaAPagarNotaEntrada(notaEntradaExistente, { validate: true, transaction: transaction })


                }

                return { lancamento: true }
            } else if (notaEntradaExistente.status == 'cancelada') {

                if (notaEntradaExistente.itens) {

                    await new this._modelMovimentacao().cancelarEntradaNota(notaEntradaExistente, notaEntradaExistente.itens, { validate: true, transaction: transaction })

                    await new this._modelDespesa().cancelarDespesaByNotaEntrada(notaEntradaExistente, { validate: true, transaction: transaction })

                    return notaEntradaExistente

                }

            } else if (notaEntradaExistente.status == 'pendente' && isEstorno == true) {

                if (notaEntradaExistente.itens) {

                    await new this._modelMovimentacao().estornarEntradaNota(notaEntradaExistente, notaEntradaExistente.itens, { validate: true, transaction: transaction })

                    await new this._modelDespesa().cancelarDespesaByNotaEntrada(notaEntradaExistente, { validate: true, transaction: transaction })

                    return notaEntradaExistente
                }
            }
        })

        return resolve

    }
}