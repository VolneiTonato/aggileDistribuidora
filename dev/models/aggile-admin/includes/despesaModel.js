const sequelize = require('./entityes/index')
const relation = require('./enuns/relation')
const _ = require('lodash')
const utilModel = require('../extras/utils-model')
const utils = require('../../../helpers/_utils/utils')
const Op = sequelize.Sequelize.Op

let conexao = sequelize.conexao


module.exports = class DespesaModel {

    constructor() {
        this._model = sequelize.entity.Despesa

        process.nextTick(() => {
            this._modelPessoa = new (require('./pessoaModel'))()
            this._modelHistoricoDespesa = require('./historicoDespesaModel')
        })


    }


    async pesquisar(conditions) {

        let where = {}

        let query = {
            include: relation().RelationFinanceiroDespesa.Despesa
        }


        if (conditions.notaEntradaId && !isNaN(parseInt(conditions.notaEntradaId)))
            _.assign(where, { notaEntradaId: conditions.notaEntradaId })


        if (conditions.dataInicial && conditions.dataFinal) {

            if (['dataLancamento', 'dataPagamento'].indexOf(conditions.dataFiltro) !== -1) {

                conditions.dataInicial = utils.DateUtil.betweenFormatQuery(conditions.dataInicial)
                conditions.dataFinal = utils.DateUtil.betweenFormatQuery(conditions.dataFinal, false)

                let testData = { [Op.gte]: conditions.dataInicial, [Op.lte]: conditions.dataFinal }


                if (['dataLancamento', 'dataPagamento'].indexOf(conditions.dataFiltro) !== -1) {

                    if (conditions.dataFiltro == 'dataLancamento')
                        where.createdAt = testData
                    else
                        where.updatedAt = testData

                } else {
                    where.createdAt = testData
                }

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

        if (conditions.status && conditions.status !== 'all') {
            where.status = conditions.status
        } else if (conditions.status !== 'all' && Object.getOwnPropertyNames(where).length == 0 && [undefined, false].indexOf(conditions.forceReturn) !== - 1) {
            return []
        }


        if (conditions.numeroNotaFiscal) {
            where[Op.or] = [
                { ['$notaEntrada.numero$']: { [Op.eq]: conditions.numeroNotaFiscal } },
                { ['$notaEntrada.id$']: { [Op.eq]: conditions.numeroNotaFiscal } }

            ]
        }

        query.where = where



        if (conditions.paginator && ('limit' in conditions.paginator))
            query.limit = parseInt(conditions.paginator.limit)

        if (conditions.paginator && ('offset' in conditions.paginator))
            query.offset = parseInt(conditions.paginator.offset)


        return await this._model.findAll(query)

    }

    async atualizarStatus(despesaId, status, options = {}) {

        try {
            let despesa = this._model.findByPk(despesaId)

            if (['cancelada', 'paga'].indexOf(despesa.status) !== -1)
                throw `Conta já ${despesa.status}`

            despesa.status = status

            return await despesa.save(options)
        } catch (err) {
            throw err
        }

    }


    async createOrUpdate(data, options = {}) {



        let { tipoPessoa, pessoaId } = data

        if (tipoPessoa && pessoaId) {
            let pessoaExists = await this._modelPessoa.getPessoaByTypeAndId(tipoPessoa, pessoaId)
            if (!pessoaExists)
                throw `${_.startCase(tipoPessoa)} não existe!`
        }




        options.validate = true


        let conta = utilModel.LoadModelToFormUtil.load(new sequelize.entity.Despesa(), data)

        if (data.id) {

            let contaExistente = await this.findOne({ id: conta.id })

            if (!contaExistente)
                throw 'Conta a pagar Inválida!'


            utilModel.LoadModelToFormUtil.setData(contaExistente, conta, ['nf', 'observacao', 'descricao'])


            return await contaExistente.save(options)


        } else {


            let despesaSave = await conexao.transaction(async (transaction) => {

                conta.saldo = data.valor
                conta.status = 'aberta'

                await conta.save({ validate: true, transaction: transaction })

                if (!conta)
                    throw 'Conta inválida!'


                await new this._modelHistoricoDespesa().saveHistoricoInicial({
                    vencimento: conta.data,
                    valor: conta.valor,
                    despesaId: conta.id,
                    status: 'aberta',
                    usuarioId: data.usuarioLogado.id
                }, { validate: true, transaction: transaction })

                return conta
            })



            return await this.findOne({ id: despesaSave.id })

        }
    }

    async cancelarDespesa(data) {
        let despesa = await this.findOne({ id: data.id })

        if (!despesa)
            throw 'Despesa inválida!'

        if (['paga', 'cancelada', 'pendente'].indexOf(despesa.status) !== -1)
            throw 'Despesa já não pode ser mais cancelado!'

        if (utils.ObjectUtil.getValueProperty(despesa, 'notaEntrada.id'))
            throw 'Não é possível cancelar uma despesa de uma Nota Fiscal!'

        let resolve = await conexao.transaction(async (transaction) => {
            despesa.status = 'cancelada'
            despesa.saldo = despesa.valor

            await despesa.save({ validate: true, transaction: transaction })

            await new this._modelHistoricoDespesa().cancelarHistoricosByDespesa(despesa, { validate: true, transaction: transaction })

            return { lancamento: true }
        })

        return resolve




    }




    async cancelarDespesaByNotaEntrada(notaEntrada, options) {
        let despesaByNotaEntrada = await this.findOne({ notaEntradaId: notaEntrada.id })



        if (!despesaByNotaEntrada)
            throw 'Despesa inválida!'

        despesaByNotaEntrada.status = 'cancelada'
        if (notaEntrada.status == 'cancelado')
            despesaByNotaEntrada.observacao = `Nota de Entrada cancelada`
        else if (notaEntrada.status == 'pendente')
            despesaByNotaEntrada.observacao = `Nota de Entrada Estornada`

        let despesa = await despesaByNotaEntrada.save(options)

        return await new this._modelHistoricoDespesa().cancelarHistoricosByDespesa(despesa, options)
    }


    async registrarContaAPagarNotaEntrada(notaEntrada, options, operacao = '') {



        if (notaEntrada.total == 0)
            return true

        let contaExistente = await this._model.findOne({ where: { notaEntradaId: notaEntrada.id } })

        let totalNotaEntrada = utils.NumberUtil.cdbl(notaEntrada.total)

        if (contaExistente) {

            let saldoAtual = utils.NumberUtil.cdbl(contaExistente.saldo)
            let valorConta = utils.NumberUtil.cdbl(contaExistente.valor)


            if (saldoAtual > 0 && valorConta !== saldoAtual && valorConta > totalNotaEntrada)
                throw 'O valor pago da Nota de Entrada é maior que o total da Nota de Entrada!'

            if (valorConta != totalNotaEntrada)
                contaExistente.valor = totalNotaEntrada

            contaExistente.status = 'aberta'

            await new this._modelHistoricoDespesa().registrarHistoricoContaAPagarNotaEntrada(contaExistente, notaEntrada, options)

            contaExistente.saldo = saldo

            return await contaExistente.save(options)
        } else {


            let despesa = {
                descricao: `Conta a pagar Nota Entrada nº ${notaEntrada.id}`,
                valor: notaEntrada.total,
                saldo: notaEntrada.total,
                status: 'aberta',
                observacao: '',
                notaEntradaId: notaEntrada.id,
                pessoaId: notaEntrada.fabricaId
            }





            let newDespesa = await this._model.create(despesa, options)



            return await new this._modelHistoricoDespesa().registrarHistoricoContaAPagarNotaEntrada(newDespesa, notaEntrada, options)
        }





    }

    async findOne(conditions = {}, orderby = []) {

        let where = {
            include: relation().RelationFinanceiroDespesa.Despesa,
            where: conditions
        }

        return await this._model.findOne(where)
    }

    async findAll(conditions, orderby = ['historico_contas_a_pagar.vencimento', 'DESC']) {
        let where = {
            include: relation().RelationFinanceiroDespesa.Despesa,
            where: conditions
        }

        return await this._model.findAll(where)
    }


}