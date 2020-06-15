/* eslint-disable no-useless-catch */
const sequelize = require('./entityes/index')
const relation = require('./enuns/relation')
const _ = require('lodash')
const utilModel = require('../extras/utils-model')
const utils = require('../../../helpers/_utils/utils')
const Op = sequelize.Sequelize.Op

let conexao = sequelize.conexao


module.exports = class RecebimentoModel {

    constructor() {
        this._model = sequelize.entity.Recebimento

        process.nextTick(() => {
            this._modelPessoa = new (require('./pessoaModel'))()
            this._modelHistoricoReceita = require('./historicoRecebimentoModel')
        })
    }

    async atualizarStatus(receitaId, status, options = {}) {

        try {
            let receita = await this._model.findByPk(receitaId)

            if (['cancelada', 'paga'].indexOf(receita.status) !== -1)
                throw `Conta já ${receita.status}`

            receita.status = status

            return await receita.save(options)
        } catch (err) {
            throw err
        }

    }


    async pesquisar(conditions) {

        let where = {}


        if (utils.ObjectUtil.getValueProperty(conditions, 'pedidoClienteId') > 0)
            where.pedidoClienteId = conditions.pedidoClienteId

        if (utils.ObjectUtil.getValueProperty(conditions, 'id') > 0)
            where.id = conditions.id


        

        if (conditions.dataInicial && conditions.dataFinal) {

            conditions.dataInicial = utils.DateUtil.betweenFormatQuery(conditions.dataInicial)
            conditions.dataFinal = utils.DateUtil.betweenFormatQuery(conditions.dataFinal, false)


            let testData = { [Op.gte]: conditions.dataInicial, [Op.lte]: conditions.dataFinal }


            if (['dataLancamento', 'dataPagamento'].indexOf(conditions.dataFiltro) !== -1) {

                if (conditions.dataFiltro == 'dataLancamento')
                    where.createdAt = testData
                else
                    where.updatedAt = testData

            }else{
                where.createdAt = testData
            }

        }

        if (conditions.pessoaId)
            where.pessoaId = conditions.pessoaId

        if (conditions.municipio && !conditions.pessoaId) {
            let pessoas = await this._modelPessoa.getPessoasByMunicipioTipoPessoa(conditions.municipio, conditions.tipoPessoa)



            if (pessoas) {
                let ids = pessoas.map((item) => { return item.id })
                where.pessoaId = { [Op.in]: ids }
            }
        }


        if (conditions.status && conditions.status != 'all')
            where.status = conditions.status
        else if (conditions.status !== 'all' && Object.getOwnPropertyNames(where).length == 0 && [undefined, false].indexOf(conditions.forceReturn) !== - 1)
            return []



        let query = {
            include: relation().RelationFinanceiroReceita.Receita,
            where: where
        }

        if(utils.StringUtil.stringToBool(conditions.mostrarProdutosPedido) == true){

            query.include.filter(item => {
                if (item.as == 'pedidoCliente')
                    item.required = true
            })
        }



        if (conditions.orderby)
            query.order = conditions.orderby



        if (conditions.paginator && ('limit' in conditions.paginator))
            query.limit = parseInt(conditions.paginator.limit)

        if (conditions.paginator && ('offset' in conditions.paginator))
            query.offset = parseInt(conditions.paginator.offset)


        return await this._model.findAll(query)

    }


    async createOrUpdate(data, options = {}) {



        let { tipoPessoa, pessoaId } = data

        if (tipoPessoa && pessoaId) {
            let pessoaExists = await this._modelPessoa.getPessoaByTypeAndId(tipoPessoa, pessoaId)
            if (!pessoaExists)
                throw `${_.startCase(tipoPessoa)} não existe!`
        }

        options.validate = true

        let conta = utilModel.LoadModelToFormUtil.load(new sequelize.entity.Recebimento(), data)
        

        if (data.id) {

            let contaExistente = await this.findOne({ id: conta.id })

            if (!contaExistente)
                throw 'Conta a pagar Inválida!'


            utilModel.LoadModelToFormUtil.setData(contaExistente, conta, ['nf', 'observacao', 'descricao', 'status'])

            return await contaExistente.save(options)


        } else {

            let receitaSave = await conexao.transaction(async (transaction) => {

            

                data.saldo = data.valor
                data.status = 'aberta'

                let conta = await this._model.create(data, options)

                if (!conta)
                    throw 'Conta inválida!'

                await new this._modelHistoricoReceita().saveHistoricoInicial({
                    vencimento: conta.data,
                    valor : conta.valor,
                    recebimentoId: conta.id,
                    status:'aberta',
                    usuarioId: data.usuarioLogado.id

                }, {validate:true, transaction:transaction})

                return conta

            })

            return await this.findOne({ id: receitaSave.id })
        }
    }

    async cancelarReceita(data) {
        let recebimento = await this.findOne({ id: data.id })

        if (!recebimento)
            throw 'Recebimento inválido!'

        if (['paga', 'cancelada', 'pendente'].indexOf(recebimento.status) !== -1)
            throw 'Recebimento já não pode ser mais cancelado!'

        if (recebimento.pedidoCliente && (recebimento.pedidoCliente.id))
            throw 'Não é possível cancelar um recebimento de um pedido!'

        let resolve = await conexao.transaction(async (transaction) => {
            recebimento.status = 'cancelada'

            await recebimento.save({ validate: true, transaction: transaction })

            await new this._modelHistoricoReceita().cancelarHistoricosByRecebimento(recebimento, { validate: true, transaction: transaction })

            return { lancamento: true }
        })

        return resolve




    }




    async cancelarRecebimentoByPedido(pedido, options) {
        let recibimentoByPedido = await this.findOne({ pedidoClienteId: pedido.id })



        if (!recibimentoByPedido)
            throw 'Recebimento inválido!'

        recibimentoByPedido.status = 'cancelada'

        if (pedido.status == 'cancelado')
            recibimentoByPedido.observacao = `${recibimentoByPedido.observacao} \n\r -> Pedido cancelado`
        else if (pedido.status == 'pendente')
            recibimentoByPedido.observacao = `${recibimentoByPedido.observacao} \n\r -> Pedido estornado`

        let recebimento = await recibimentoByPedido.save(options)

        return await new this._modelHistoricoReceita().cancelarHistoricosByRecebimento(recebimento, options)
    }


    async registrarContaAReceberPedido(pedido, options, operacao = '') {

        if (pedido.total == 0)
            return true

        let contaExistente = await this._model.findOne({ where: { pedidoClienteId: pedido.id } })

        let totalPedido = utils.NumberUtil.cdbl(pedido.total)

        if (contaExistente) {

            let saldoAtual = utils.NumberUtil.cdbl(contaExistente.saldo)
            let valorConta = utils.NumberUtil.cdbl(contaExistente.valor)

            //if (saldoAtual > 0 && saldoAtual > totalPedido)
            //    throw 'O valor pago do pedido é maior que o total do pedido!'

            if (saldoAtual > 0 && valorConta !== saldoAtual && valorConta > totalPedido)
                throw 'O valor pago do pedido é maior que o total do pedido!'



            if (valorConta != totalPedido)
                contaExistente.valor = totalPedido



            contaExistente.status = 'aberta'

            let saldo = await new this._modelHistoricoReceita().registrarHistoricoContaAReceberPedido(contaExistente, pedido, options)

            contaExistente.saldo = saldo

            return await contaExistente.save(options)
        } else {


            let recebimento = {
                descricao: 'Conta a pagar pedido nº ' + pedido.id,
                valor: pedido.total,
                saldo: pedido.total,
                status: 'aberta',
                observacao: '',
                pedidoClienteId: pedido.id,
                pessoaId: pedido.clienteId
            }

            let newRecebimento = await this._model.create(recebimento, options)

            return await new this._modelHistoricoReceita().registrarHistoricoContaAReceberPedido(newRecebimento, pedido, options)
        }





    }

    async findOne(conditions = {}, orderby = []) {

        let where = {
            include: relation().RelationFinanceiroReceita.Receita,
            where: conditions
        }

        return await this._model.findOne(where)
    }

    async findAll(conditions, orderby = ['historico_contas_a_receber.vencimento', 'DESC']) {
        let where = {
            include: relation().RelationFinanceiroReceita.Receita,
            where: conditions,
            // order: [orderby]
        }

        return await this._model.findAll(where)
    }


}




