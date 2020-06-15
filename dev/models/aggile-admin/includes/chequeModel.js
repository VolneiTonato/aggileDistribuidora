const sequelize = require('./entityes/index')
const _ = require('lodash')
const enums = require('./enuns/enum')
const Op = sequelize.Sequelize.Op
const utilModel = require('../extras/utils-model')
const relation = require('./enuns/relation')
const utils = require('../../../helpers/_utils/utils')


let conexao = sequelize.sequelize


module.exports = class ChequeModel {

    constructor() {
        this._model = sequelize.entity.Cheque

        process.nextTick(() => {
            this._contaBancariaModel = require('./contaBancariaModel')
            this._pessoaModel = require('./pessoaModel')
            this._historicoChequeModel = require('./historicoChequeModel')
            this._historicoDespesaModel = require('./historicoDespesaModel')
            this._historicoReceitaModel = require('./historicoRecebimentoModel')
        })
    }


    async pesquisar(conditions = {}) {


        let where = {}



        if (conditions.numero)
            where.numero = conditions.numero

        if (enums.EnumStatusCheque.map(status => { return status.value }).indexOf(conditions.status) !== -1) {
            let ids = await new this._historicoChequeModel().findAllIdsChequeByStatus([conditions.status])

            where.id = { [Op.in]: ids }
        }

        if (utils.NumberUtil.cdbl(conditions.bancoId))
            where['$contaBancaria.pessoaAgencia.agencia.banco_id$'] = { [Op.eq]: conditions.bancoId }

        if (utils.NumberUtil.cdbl(conditions.contaBancariaId))
            where.contaBancariaId = { [Op.eq]: conditions.contaBancariaId }

        if (utils.NumberUtil.cdbl(conditions.emissorId))
            where.emissorId = { [Op.eq]: conditions.emissorId }


        let query = {
            include: relation().RelationCheque.Cheque
        }

        if (Object.getOwnPropertyNames(where).length > 0)
            query.where = where


        if (conditions.paginator && ('limit' in conditions.paginator))
            query.limit = parseInt(conditions.paginator.limit)

        if (conditions.paginator && ('offset' in conditions.paginator))
            query.offset = parseInt(conditions.paginator.offset)


        return await this._model.findAll(query)
    }


    async validateEmissor(data) {

        let emissor = await new this._pessoaModel().findOne({ id: data.emissorId })

        if (!emissor)
            throw 'Emissor inválido!'

        if (emissor.tipoPessoa !== data.tipoEmissor)
            throw 'Tipo Emissor difere do tipo pessoa!'



    }


    async findByAutoComplete(param) {

        let { pesquisa } = param


        let query = {

            include: relation().RelationCheque.Cheque,

            where: {
                [Op.or]: [
                    { numero: { [Op.eq]: `${pesquisa}` } }
                ]
            }
        }

        if (utils.NumberUtil.cdbl(pesquisa)) {
            query.where[Op.or].push({ '$contaBancaria.pessoaAgencia.agencia.banco_id$': { [Op.eq]: pesquisa } })
            query.where[Op.or].push({ '$contaBancaria.id$': { [Op.eq]: pesquisa } })
            query.where[Op.or].push({ '$emissor.id$': { [Op.eq]: pesquisa } })

        }


        if (_.isArray(param.status)) {

            let ids = await (await new this._historicoChequeModel()).findAllIdsChequeByStatus(param.status)

            query.where[Op.and] = { id: { [Op.in]: ids } }


        }



        return await this._model.findAll(query)

    }

    async agenciasByMunicipio(municipioId) {

        let query = {
            include: relation().RelationAgencia
        }

        let where = {}

        query.include.filter((item) => {
            if (item.as == 'enderecos') {
                _.assign(item.where, { municipioId: municipioId })
                item.required = true
            }
        })

        query.where = where

        return await this._model.findAll(query)
    }


    async update(data) {

        await this.uniqueNumeroEmissorContaBancaria(data).catch(err => { throw err })

        await this.validateEmissor(data).catch(err => { throw err })

        let chequeExistente = await this.findOne({ id: data.id })

        if (!chequeExistente)
            throw 'Cheque inválido!'

        if (chequeExistente.status !== 'pendente')
            throw 'Não será possível alterar dados de um cheque com históricos lançados!'


        delete data.origemLancamento


        utilModel.LoadModelToFormUtil.loadChangeModel(chequeExistente, _.clone(data))



        await chequeExistente.save({ validate: true })


        return await this.findOne({ id: chequeExistente.id })
    }

    async createOrUpdate(data) {

        if (!isNaN(parseInt(data.id)))
            return await this.update(data)
        else
            return await this.save(data)
    }

    async uniqueNumeroEmissorContaBancaria(data = {}) {

        let query = {
            where: {

                numero: data.numero,
                emissorId: data.emissorId,
                contaBancariaId: data.contaBancariaId

            }
        }


        if (data.id)
            _.assign(query.where, { id: { [sequelize.Op.ne]: data.id } })

        let chequeUnique = await this._model.findOne(query)


        if (chequeUnique)
            return Promise.reject(`Cheque já cadastrado!`)


        return Promise.resolve()
    }


    async generateSerie(data) {
        try {
            let contaBancaria = await new this._contaBancariaModel().findOne(data.contaBancariaId)

            if (!contaBancaria)
                throw 'Conta bancária inválida!'


            let serie = `${_.get(contaBancaria, 'pessoaAgencia.agencia.banco.codigo')}${_.get(contaBancaria, 'pessoaAgencia.id')}`

            if (!serie)
                throw 'Erro ao gerar número de série'

            data.serie = serie

            return Promise.resolve(serie)

        } catch (err) {
            return Promise.reject(err)
        }
    }


    async obterValorLancadoContas(chequeId) {

        let cheque = await this._model.findOne({ where: { id: chequeId }, include: [{ model: sequelize.entity.HistoricoCheque, as: 'historicos' }] })



        let historicosDespesa = await new this._historicoDespesaModel()._model.findAll({ where: { chequeId: cheque.id }, include: [{ model: sequelize.entity.Despesa, as: 'despesa' }] })

        let historicosReceita = await new this._historicoReceitaModel()._model.findAll({ where: { chequeId: cheque.id }, include: [{ model: sequelize.entity.Recebimento, as: 'recebimento' }] })

        let isChequeAlone = false

        if (!utils.ArrayUtil.length(historicosReceita) && !utils.ArrayUtil.length(historicosDespesa))
            isChequeAlone = true




        let data = {
            despesas: [],
            receitas: [],
            valor: cheque.valor
        }

        const mountObject = (row, type) => {
            let data = {
                valor: row.valor,
                valorRecebido: row.valorRecebido,
                id: row.id,
                valorTotal: row.valorTotal,
                status: row.status,
                pessoaId: row[type].pessoaId
            }

            if (type == 'despesa')
                data.notaEntradaId = row.notaEntradaId
            else if (type == 'receita')
                data.pedidoClienteId = row.pedidoClienteId

            return data
        }

        for (let row of historicosDespesa)
            data.despesas.push(mountObject(row, 'despesa'))

        if (cheque.origemLancamento == 'receita')
            for (let row of historicosReceita)
                data.receitas.push(mountObject(row, 'recebimento'))


        data.getValorLancadoReceita = (currentData) => {
            if (cheque.origemLancamento == 'despesa')
                return 0.00

            if (!currentData)
                currentData = data

            let valorLancado = 0.00

            let valorReceita = currentData.receitas.map(row => {
                if (row.status == 'aberta')
                    return row.valor
                return utils.NumberUtil.sum(row.valorTotal, row.troco)
            })



            if (utils.ArrayUtil.length(valorReceita))
                valorLancado = utils.NumberUtil.sum(valorLancado, valorReceita.reduce((a, b) => { return utils.NumberUtil.cdbl(a) + utils.NumberUtil.cdbl(b) }))



            if (isChequeAlone == true && ['recebido'].indexOf(cheque.status) !== -1)
                valorLancado = utils.NumberUtil.sum(valorLancado, utils.NumberUtil.cdbl(cheque.valor))

            return valorLancado
        }


        data.getValorLancadoDespesa = (currentData) => {

            //if(['depositado','cancelado','aguardando_depositado'].indexOf(cheque.status))
            //    return 0.00

            if (!currentData)
                currentData = data

            let valorLancado = 0.00

            let valorDespesa = currentData.despesas.map(row => {
                if (row.status == 'aberta')
                    return row.valor
                return utils.NumberUtil.sum(row.valorTotal, row.troco)
            })


            if (utils.ArrayUtil.length(valorDespesa))
                valorLancado = valorDespesa.reduce((a, b) => { return a + b })


            if (isChequeAlone == true && ['repasse_pagamento'].indexOf(cheque.status) !== -1)
                valorLancado = utils.NumberUtil.cdbl(valorLancado) + utils.NumberUtil.cdbl(cheque.valor)

            return valorLancado
        }


        data.getValorPendenteDespesa = (currentData) => {
            if (!currentData)
                currentData = data

            currentData.valorLancadoDespesa = data.getValorLancadoDespesa(currentData)

         
            currentData.valorPendenteDespesa = cheque.valor - currentData.valorLancadoDespesa


            return currentData.valorPendenteDespesa
        }


        data.getValorPendenteReceita = (currentData) => {
            if (!currentData)
                currentData = data

            currentData.valorLancadoReceita = data.getValorLancadoReceita(currentData)


          
            currentData.valorPendenteReceita = cheque.valor - currentData.valorLancadoReceita


            return currentData.valorPendenteReceita
        }

        data.getValorPendenteReceita(data)
        data.getValorPendenteDespesa(data)

        return data
    }


    async validateChequeReceitaDespesa(historicoConta = {}, type = null) {


        return new Promise(async (resolve, reject) => {

            let defaultType = [
                { type: 'despesa', column: 'despesaId', model: this._historicoDespesaModel },
                { type: 'receita', column: 'recebimentoId', model: this._historicoReceitaModel }
            ]

            let typeValidate = _.find(defaultType, { type: type })


            if (typeValidate == undefined)
                return reject('Invalid type ValidateChequeReceitaDespesa')




            if (['cheque', 'cheque_pre'].indexOf(historicoConta.formaPagamento) === -1)
                historicoConta.chequeId = null

            if (!historicoConta.chequeId)
                resolve(historicoConta)


            let cheque = await this._model.findOne({
                where: { id: historicoConta.chequeId },
                include: [{ model: sequelize.entity.HistoricoCheque, as: 'historicos' }]
            })

            if (!cheque)
                reject('Cheque inválido!')

            if (['depositado', 'aguardando_depositado', 'cancelado'].indexOf(cheque.status) !== -1)
                reject(`O cheque já está com status: ${cheque.status}! Não será possível usa-lo neste pagamento!`)


            let conta = await new typeValidate.model()._model.findOne({ where: { id: historicoConta[typeValidate.column] } })


            if (!conta)
                return reject(`Conta inválida!`)


            if (typeValidate.type == 'despesa') {

                if (cheque.status == 'repasse_pagamento' && conta.pessoaId !== _.get(cheque, 'lastHistorico.pessoaRepasseId'))
                    return reject(`O cheque já foi repassado para pagamento para outra pessoa!`)

            }


            let historicosReceitaExistsCheque = await this._model.findAll({
                where: {
                    chequeId: { [Op.eq]: historicoReceita.chequeId }
                }
            })



            let lancamentoCheque = await new this._chequeModel().obterValorLancadoContas(historicoReceita.chequeId)


            //valores pagos anteriores
            let total = historicosReceitaExistsCheque.reduce((prevVal, elem) => { return prevVal + elem.valorTotal }, 0)



            if (total >= cheque.valor)
                return reject(`Já existe um lançamento deste cheque para outro histórico no valor de R$ ${total}!`)

            let totalGeral = Math.abs(utils.NumberUtil.sum(total, historicoReceita.valorTotal))

            if (totalGeral > cheque.valor)
                return reject(`O valor do cheque de ${cheque.valor} é menor do que o valor total lançado R$ ${totalGeral}!<br />
                        Total Anterior Lançado: R$ ${total}<br />
                        Lançamento Atual: R$ ${historicoReceita.valorTotal}`)




            return reject('deu ruim')






            resolve(historicoReceita)

        })
    }



    async obterContasVinculadasHistoricoCheque(data) {

        let { chequeId } = data

        let retorno = {
            despesas: [], receitas: []
        }

        let cheque = await this.findOne({ id: chequeId })

        let receitas = await new this._historicoReceitaModel().findBy({ chequeId: chequeId })

        let despesas = await new this._historicoDespesaModel().findBy({ chequeId: chequeId })


        let valoresPendentes = await this.obterValorLancadoContas(chequeId)


        retorno.receitas = _.chain(receitas)
            .groupBy('recebimentoId')
            .toPairs()
            .map((item) => { return _.zipObject(['recebimentoId', 'historicos'], item) })
            .each((item) => {
                item.header = (_.head(item.historicos) || {}).recebimento
                item.historicos = _.orderBy(item.historicos, ['id'], ['asc'])
            })
            .value()

        retorno.despesas = _.chain(despesas)
            .groupBy('despesaId')
            .toPairs()
            .map((item) => { return _.zipObject(['despesaId', 'historicos'], item) })
            .each((item) => {
                item.header = (_.head(item.historicos) || {}).despesa
                item.historicos = _.orderBy(item.historicos, ['id'], ['asc'])
            })
            .value()



        retorno.valorPendente = valoresPendentes

        retorno.cheque = cheque

        return retorno


    }





    async save(data) {

        let cheque = await conexao.transaction(async (transaction) => {


            await this.uniqueNumeroEmissorContaBancaria(data)
                .catch(err => {
                    throw err
                })


            await this.validateEmissor(data).catch(err => { throw err })


            let cheque = utilModel.LoadModelToFormUtil.loadChangeModel(new sequelize.entity.Cheque(), data)


            await cheque.save({ validate: true, transaction: transaction })

            await new this._historicoChequeModel().saveHistoricoInicial(cheque, data.usuarioLogado, { validate: true, transaction: transaction })

            return cheque

        })

        return await this.findOne({ id: cheque.id })

    }



    async findOne(conditions = {}) {

        let where = {
            include: relation().RelationCheque.Cheque,
            where: conditions
        }

        return await this._model.findOne(where)
    }

    async findAll(conditions) {

        let where = {
            include: relation().RelationCheque.Cheque,
        }

        if (conditions) {

            where = {
                where: conditions
            }
        }

        return await this._model.findAll(where)
    }


}