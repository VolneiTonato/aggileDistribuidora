const sequelize = require('./entityes/index')
const relation = require('./enuns/relation')
const _ = require('lodash')
const utilModel = require('../extras/utils-model')
const utils = require('../../../helpers/_utils/utils')
const Op = sequelize.Sequelize.Op
const async = require('async')


let conexao = sequelize.conexao

const methodsPrivate = {
    saveChequeRepasse: Symbol('saveChequeRepasse')
}


module.exports = class HistoricoDespesaModel {
    constructor() {
        this._model = sequelize.entity.HistoricoDespesa


        process.nextTick(() => {
            this._despesaModel = new (require('./despesaModel'))()
            this._chequeModel = require('./chequeModel')
            this._historicoChequeModel = require('./historicoChequeModel')
            this._pessoaModel = require('./pessoaModel')
        })
    }

    async [methodsPrivate.saveChequeRepasse](historico = {}, options = {}) {
        if (historico.chequeId > 0 && ['cheque', 'cheque_pre'].indexOf(historico.formaPagamento) !== -1) {

            let cheque = await new this._chequeModel().findOne({ id: historico.chequeId })

            let conta = await this._despesaModel._model.findOne({ where: { id: historico.despesaId } })

            let observacaoCheque = `Repasse referente à despesa de nº ${conta.id}`

            

            if(conta.notaEntradaId > 0)
                observacaoCheque += `- Nota Entrada nº ${conta.notaEntradaId}`


            if (cheque && _.get(cheque, 'status') !== 'repasse_pagamento') {

                let pessoaRepasse = await new this._pessoaModel()._model.findOne({ where: { id: conta.pessoaId } })

                if (!pessoaRepasse)
                    throw `Pessoa inválida para repasse do cheque!`

                return await new this._historicoChequeModel().saveRepasseToContas(
                    { observacao: observacaoCheque, chequeId: historico.chequeId, pessoaRepasseId: pessoaRepasse.id, tipoPessoaRepasse: pessoaRepasse.tipoPessoa, status:'repasse_pagamento' },
                    { id: historico.usuarioId }, options
                )

            }
        }else{
            return true
        }
    }

    async pagamentoTotal(data = {}) {


        let historicos = await this._model.findAll({ where: { despesaId: data.id } })


        if (utils.ArrayUtil.length(historicos) == 0)
            throw 'Conta sem históricos!'

        if (historicos.filter(item => {
            return ['aberta', 'paga'].indexOf(item.status) === -1
        }).length > 0)
            throw `Já existem históricos lançados para esta despesa e que constam com outro status diferente de Aberta!<br />Lance manualmente os pagamentos`

        if (historicos.filter(item => {
            return item.chequeId > 0 && item.status == 'aberta'
        }).length > 0)
            throw `Existem históricos com cheque vinculado! Será necessário lançar manualmente os valores.`




        let retorno = await conexao.transaction(async (transaction) => {


            //let valorTotalPago = 0.00

            for (let historico of historicos) {

                if (historico.status !== 'aberta')
                    continue

                historico.valorTotal = historico.valor
                historico.valorRecebido = historico.valor
                historico.status = 'paga'
                historico.formaPagamento = 'dinheiro'
                historico.usuarioId = _.get(data, 'usuarioLogado.id')
                historico.chequeId = null
                historico.troco = 0.00
                historico.desconto = 0.00
                historico.juro = 0.00
                historico.dataPagamento = new Date()

                //valorTotalPago = utils.NumberUtil.sum(valorTotalPago, historico.valorTotal)

                await historico.save({ validate: true, transaction: transaction })



            }

            await this._despesaModel._model.update({ saldo: 0.00, status: 'paga' }, { where: { id: data.id } }, { validate: true, transaction: transaction })

            return { lancamento: true }
        })

        return retorno
    }




    async pagamento(data) {


        let historico = utilModel.LoadModelToFormUtil.load(new sequelize.entity.HistoricoDespesa(), data)


        if (['paga'].indexOf(historico.status) !== -1 && !data.isPagamentoMarcado == 'true')
            throw 'Conta já Paga'

        if (!historico.formaPagamento)
            throw 'Forma de pagamento Obrigatória!'




        let historicoExistente = await this.findOne({ id: historico.id, despesaId: historico.despesaId })

        if(historicoExistente.status == 'estornada')
            throw `Historico consta como estornado! Não será permitido o pagamento do mesmo.`


        if (data.lancarNovaConta == 'true') {
            historico.desconto = 0.00
            historico.juro = 0.00
        }



        historicoExistente = utilModel.LoadModelToFormUtil.setData(historicoExistente, historico, [
            'juro', 'desconto', 'chequeId', 'troco', 'dataBomPara', 'formaPagamento', 'valorTotal', 'observacao', 'valorRecebido'
        ])


        if (['boleto_a_prazo', 'deposito', 'recibo'].indexOf(historicoExistente.formaPagamento) != -1) {
            if (historicoExistente.status == 'pendente' && historico.status == 'paga' && data.isPagamentoMarcado == 'true')
                historicoExistente.status = 'paga'
            else
                historicoExistente.status = 'pendente'
        } else {
            historicoExistente.status = 'paga'
        }

        if (historicoExistente.status = 'paga')
            historicoExistente.dataPagamento = historico.dataPagamento

        if (['cheque', 'cheque_pre'].indexOf(historicoExistente.formaPagamento) !== -1 || utils.NumberUtil.cdbl(historicoExistente.chequeId) > 0)
            await this.validateCheque(historicoExistente).catch(err => { throw err.toString() })



        let resolve = await conexao.transaction(async (transaction) => {

            try {

                await historicoExistente.save({ validate: true, transaction: transaction })

                

                let historicos = await this.findBy({ despesaId: historicoExistente.despesaId })



                let statusAtualConta = historicos.map((item) => {
                    return ['pendente', 'aberta'].indexOf(item.status) != -1 && item.id != historicoExistente.id
                }).indexOf(true) !== -1


                let isAberta = historicoExistente.status


                if (data.lancarNovaConta == 'true' && parseFloat(historicoExistente.valor) > parseFloat(historicoExistente.valorLiquido)) {



                    let vencimento = utils.DateUtil.getMoment().add(15, 'days').format('DD/MM/YYYY')

                    let historicoNew = {
                        valor: parseFloat(utils.NumberUtil.diminuir(historicoExistente.valor, historicoExistente.valorLiquido)),
                        valorTotal: 0.00,
                        valorRecebido:0.00,
                        juro: 0.00,
                        desconto: 0.00,
                        vencimento: vencimento,
                        dataPagamento: vencimento,
                        status: 'aberta',
                        observacao: '',
                        despesaId: historicoExistente.despesaId,
                        usuarioId: historicoExistente.usuarioId

                    }

                    let historicoSave = utilModel.LoadModelToFormUtil.load(new sequelize.entity.HistoricoDespesa(), historicoNew)

                    await historicoSave.save({ validate: true, transaction: transaction })

                    isAberta = 'aberta'


                }

                let conta = await this._despesaModel._model.findOne({
                    where: { id: historicoExistente.despesaId },
                    include: [{ model: sequelize.entity.HistoricoDespesa, as: 'historicos' }]
                })


                if (conta.status == 'cancelada')
                    throw 'Conta já foi cancelada! Não é possível adicionar novos lançamentos!'
                else if (conta.status == 'paga')
                    throw 'Conta já está paga! Não é possível adiconar novos lançamentos!'

                let statusPendenteExistente = conta.historicos.map(item => {
                    return ['boleto_a_prazo', 'deposito', 'recibo'].indexOf(item.formaPagamento) !== -1 && item.status == 'pendente' && item.id != historicoExistente.id
                }).indexOf(true) !== -1

                let saldo = historicos.map((item) => {
                    if (item.status == 'aberta' && item.id != historicoExistente.id)
                        return item.valor
                    return 0.00
                }).reduce((a, b) => { return a + b }, 0)

                if (saldo < 0)
                    saldo = 0

                conta.saldo = saldo

                conta.status = isAberta

                if (statusAtualConta == true)
                    conta.status = 'aberta'

                if (statusPendenteExistente)
                    conta.status = 'pendente'

                await conta.save({ validate: true, transaction: transaction })

                if (historicoExistente.chequeId > 0)
                    await this[methodsPrivate.saveChequeRepasse](historicoExistente, { validate: true, transaction: transaction })

                return true

            } catch (err) {
                throw err
            }
        })

        return resolve

    }

    async saveHistoricoParcelas(data) {

        let historico = utilModel.LoadModelToFormUtil.load(new sequelize.entity.HistoricoDespesa(), _.clone(data))

        let historicoExistente = await this._model.findOne({
            where:
                { id: historico.id, despesaId: historico.despesaId },
        }).catch(err => { throw 'Erro ao consultar históricos!' })

        if (['pendente', 'aberta', 'estornada'].indexOf(historicoExistente.status) !== 1)
            throw 'O status do histórico é diferente de aberto!'




        let values = {
            valor: utils.NumberUtil.cdbl(historicoExistente.valor),
            parcelas: utils.NumberUtil.cInt(data.parcela.quantidade),
            dias: utils.NumberUtil.cInt(data.parcela.dias),
            valorUnitario: utils.NumberUtil.divisao(historicoExistente.valor, data.parcela.quantidade)
        }

        if (values.quantidade <= 0 || values.dias <= 0)
            throw 'Não há informações para lançamento da parcela'


        let parcelas = []
        utils.ArrayUtil.createArrayInteger(values.parcelas).forEach(parcela => {

            let valor = values.valorUnitario

            if (parcela === values.parcelas)
                valor = utils.NumberUtil.diminuir(values.valor, _.sumBy(parcelas, 'valor'))

            parcelas.push({ parcela: parcela, valor: valor, dias: utils.NumberUtil.multiplicacao(values.dias, parcela) })
        })


        historicoExistente = utilModel.LoadModelToFormUtil.setData(historicoExistente, historico, ['vencimento', 'observacao', 'usuarioId', 'formaPagamento', 'chequeId'])

        await conexao.transaction(async (transaction) => {

            for (let [i, item] of parcelas.entries()) {

                let vencimento = utils.DateUtil.getMoment(utils.DateUtil.formatPtbrToUniversal(historicoExistente.vencimento)).add(item.dias, 'days').format('DD/MM/YYYY')

                if (i === 0) {
                    historicoExistente.valor = item.valor

                    if (historicoExistente.status != 'paga') {
                        historicoExistente.status = 'aberta'
                        historicoExistente.valorTotal = 0.00
                        historicoExistente.valorRecebido = 0.00
                    }


                    if (!historicoExistente.vencimento)
                        historicoExistente.vencimento = new Date()

                    if (['cheque', 'cheque_pre'].indexOf(historicoExistente.formaPagamento) !== -1 || utils.NumberUtil.cdbl(historicoExistente.chequeId) > 0)
                        await this.validateCheque(historicoExistente).catch(err => { throw err.toString() })

                    await historicoExistente.save({ validate: true, transaction: transaction }).catch((err) => { throw err })

                    await this[methodsPrivate.saveChequeRepasse](historicoExistente, { validate: true, transaction: transaction }).catch(err => { throw err })
                } else {



                    let historicoNew = {
                        valor: item.valor,
                        valorTotal: 0.00,
                        valorRecebido: 0.00,
                        juro: 0.00,
                        vencimento: vencimento,
                        status: 'aberta',
                        observacao: '',
                        despesaId: historicoExistente.despesaId,
                        usuarioId: historicoExistente.usuarioId
                    }

                    await this._model.create(historicoNew, { validate: true, transaction: transaction })
                }


            }

        })

        return true
    }


    async validateCheque(historicoDespesa = {}) {


        return new Promise(async (resolve, reject) => {

            if (['cheque', 'cheque_pre'].indexOf(historicoDespesa.formaPagamento) === -1)
                historicoDespesa.chequeId = null

            if (!historicoDespesa.chequeId)
                return resolve(historicoDespesa)

            const chequeModel = await new this._chequeModel()

            let cheque = await chequeModel._model.findOne({
                where: { id: historicoDespesa.chequeId },
                include: [{ model: sequelize.entity.HistoricoCheque, as: 'historicos' }]
            })



            if (!cheque)
                reject('Cheque inválido!')

            if (['depositado', 'aguardando_depositado', 'cancelado'].indexOf(cheque.status) !== -1)
                reject(`O cheque já está com status: ${cheque.status}! Não será possível usa-lo neste pagamento!`)


            let conta = await this._despesaModel._model.findOne({ where: { id: historicoDespesa.despesaId } })

            if (!conta)
                return reject(`Conta inválida!`)

            if (cheque.status == 'repasse_pagamento' && conta.pessoaId !== _.get(cheque, 'lastHistorico.pessoaRepasseId'))
                return reject(`O cheque já foi repassado para pagamento para outra pessoa!`)


            let lancamentoCheque = await chequeModel.obterValorLancadoContas(cheque.id)

            let cloneLancamentoCheque = _.clone(lancamentoCheque)

          

            cloneLancamentoCheque.despesas = _.reject(cloneLancamentoCheque.despesas, { id: historicoDespesa.id })

            

            const valorLancado = cloneLancamentoCheque.getValorLancadoDespesa(cloneLancamentoCheque)
            
            

            let valor = historicoDespesa.valorTotal > 0 ? historicoDespesa.valorTotal : historicoDespesa.valor


            let totalGeral = Math.abs(utils.NumberUtil.sum(valorLancado, valor))


            if (totalGeral > cheque.valor)
                return reject(`O valor do cheque de ${cheque.valor} é menor do que o valor total lançado R$ ${totalGeral}!<br />
                        Total Anterior Lançado: R$ ${valorLancado}<br />
                        Lançamento Atual: R$ ${valor}`)



            resolve(historicoDespesa)

        })
    }

    async saveHistoricoInicial(data = {}, options = {}) {
        let historico = utilModel.LoadModelToFormUtil.loadChangeModel(new sequelize.entity.HistoricoDespesa(), _.clone(data))

        return await historico.save(options)
    }


    async save(data) {


        let historico = utilModel.LoadModelToFormUtil.loadChangeModel(new sequelize.entity.HistoricoDespesa(), _.clone(data))



        let historicoExistente = await this._model.findOne({
            where:
                { id: historico.id, despesaId: historico.despesaId },
        }).catch(err => {
            throw `Ocorreu um erro ao buscar históricos!`
        })

        if (!historicoExistente)
            throw 'Histórico invlido!'


        if(historicoExistente.status == 'estornada')
            throw `Historico consta como estornado! Não será permitido o pagamento do mesmo.`





        let conta = await this._despesaModel._model.findOne({ where: { id: historico.despesaId } })


        let historicoSave = await conexao.transaction(async (transaction) => {

            if (conta.status != historico.status) {
                conta.status = historico.status
                conta.save({ validate: true, transaction: transaction })
            }



            historicoExistente = utilModel.LoadModelToFormUtil.setData(historicoExistente, historico, ['vencimento', 'observacao', 'usuarioId', 'formaPagamento', 'chequeId'])


            if (['cheque', 'cheque_pre'].indexOf(historicoExistente.formaPagamento) !== -1 || utils.NumberUtil.cdbl(historicoExistente.chequeId) > 0)
                await this.validateCheque(historicoExistente).catch(err => { throw err.toString() })



            await historicoExistente.save({ validate: true, transaction: transaction })

            await this[methodsPrivate.saveChequeRepasse](historicoExistente, { validate: true, transaction: transaction })

            return historicoExistente




        })

        return await this.findOne({ id: historicoSave.id })
    }

    async findOne(conditions = {}, orderby = []) {

        let where = {
            include: relation().RelationFinanceiroDespesa.Historicos,
            where: conditions
        }

        return await this._model.findOne(where)
    }

    async findByInclude(conditions = {}, include = []) {
        let where = {
            include: include,
            where: conditions
        }

        return await this._model.findAll(where)
    }


    async findBy(conditions) {



        let where = {
            include: relation().RelationFinanceiroDespesa.Historicos,
            where: conditions,
            order: [['id', 'ASC']]
        }



        return await this._model.findAll(where)
    }


    async cancelarHistoricosByDespesa(despesa, options) {

        //colocar rotina para desvincular o cheque

        await this._model.update({ status: 'cancelada', chequeId: null, formaPagamento : '' }, { where: { despesaId: despesa.id } }, options)

    }

    async estornarPagamentoCheque(chequeId, operacao, options) {


        let run = async (options) => {

            if (['cancelado', 'devolvido'].indexOf(operacao) === -1)
                throw `Operação inválida para estorno de pagamento`

            let historicos = await this._model.findAll({ where: { chequeId: chequeId }, order: [['despesaId', 'ASC']] })

            if (!utils.ArrayUtil.length(historicos))
                return true

            let cheque = await new this._chequeModel().findOne({id : chequeId})

            cheque.emissor = cheque.emissor.toJSON()
            cheque.contaBancaria = cheque.contaBancaria.toJSON()
           
            
            let idsDespesa = _.uniq(_.map(historicos, 'despesaId'))

            let groupHistoricos = _.groupBy(historicos, 'despesaId')

            

            for (let id of idsDespesa) {

                let isAltered = false

                let saldoNovoHistorico = 0

                for (let hist of groupHistoricos[id]) {


                    if(hist.status == 'aberta' && operacao == 'devolvido')
                        continue

                    let historicoNew = {
                        //valor: hist.valor,
                        valorRecebido: 0.00,
                        valor: utils.NumberUtil.sum(utils.NumberUtil.diminuir(hist.valorTotal, hist.juro), hist.desconto),
                        valorTotal: 0.00,
                        juro: 0.00,
                        desconto: 0.00,
                        vencimento: hist.vencimento,
                        status: 'aberta',
                        observacao: '',
                        despesaId: hist.despesaId,
                        usuarioId: hist.usuarioId,
                        chequeId: hist.chequeId,
                        formaPagamento: hist.formaPagamento
                    }
                    saldoNovoHistorico = utils.NumberUtil.sum(saldoNovoHistorico, historicoNew.valor)
                    
                    
                    hist.status = 'estornada'
                    hist.chequeId = null
                    hist.observacao = `Cheque nº ${cheque.numero} - Emissor: ${cheque.emissor.nome} - Titular: ${cheque.contaBancaria.titular}`
                    

                    await hist.save(options)

                    await this._model.create(historicoNew, options)

                    isAltered = true
                }


                if(isAltered == false)
                    continue

                let despesa = await this._despesaModel._model.findOne({where : {id : id}, include : [{model: sequelize.entity.HistoricoDespesa, as: 'historicos'}]})

                let saldo = _.sumBy( _.filter(despesa.historicos, (row) => {
                    if(['aberta','pendente'].indexOf(row.status) !== -1 && ['cheque', 'cheque_pre'].indexOf(row.formaPagamento) == -1)
                        return row
                }), 'valor')


                despesa.saldo = utils.NumberUtil.sum(saldo, saldoNovoHistorico)

                //throw 'err'
                despesa.status = 'aberta'
                
                await despesa.save(options)

            }
        }

        if (!_.get(options, 'transaction')) {
            return await conexao.transaction(async transaction => {
                return await run({ transaction: transaction, validate: true })
            })
        } else {
            return await run(options)
        }



    }




    async registrarHistoricoContaAPagarNotaEntrada(despesa, notaEntrada, options) {


        return new Promise(async (resolve, reject) => {

            let historicosExiste = await this._model.findAll({ where: { despesaId: despesa.id }, include: [{ all: true }] })


            if (_.isArray(historicosExiste) && (historicosExiste.length > 0)) {

                let isLancarNovoHistorico = false

                let saldo = 0

                let valorTotalTotal = 0


                let totalHistoricos = historicosExiste.length


                async.forEachOf(historicosExiste, (item, key, next) => {

                    if (key == 0)
                        item.valor = notaEntrada.total

                    //if (totalHistoricos === 1 && (utils.NumberUtil.cdbl(item.valorTotal) < utils.NumberUtil.cdbl(item.valor)))
                    if (totalHistoricos === 1 && utils.NumberUtil.cdbl(item.valorTotal) > 0 && (utils.NumberUtil.cdbl(item.valorTotal) < utils.NumberUtil.cdbl(item.valor)))
                        isLancarNovoHistorico = true


                    if (item.valorTotal > 0)
                        item.status = 'paga'
                    else
                        item.status = 'aberta'


                    valorTotalTotal += utils.NumberUtil.cdbl(item.valorTotal)

                    saldo = utils.NumberUtil.diminuir(notaEntrada.total, valorTotalTotal)

                    if ((key + 1) == totalHistoricos && totalHistoricos > 1)
                        item.valor = saldo



                    this._model.update({ valorTotal: item.valorTotal, valor: item.valor, status: item.status }, { where: { id: item.id, despesaId: despesa.id } }, options)
                        .then((r) => {
                            next(null)
                        }).catch((er) => { next(err) })

                }, (err) => {

                    if (err)
                        return reject(err)

                    async.waterfall([

                        (done) => {

                            saldo = utils.NumberUtil.cdbl(saldo)

                            if (isLancarNovoHistorico == true) {

                                let historico = {
                                    valor: saldo,
                                    valorTotal: 0.00,
                                    valorRecebido: 0.00,
                                    juro: 0.00,
                                    vencimento: new Date(),
                                    dataPagamento: new Date(),
                                    status: 'aberta',
                                    observacao: '',
                                    despesaId: despesa.id,
                                    usuarioId: notaEntrada.usuarioId
                                }
                                this._model.create(historico, options)
                                    .then((ok) => { done(null, { saldo: saldo }) })
                                    .catch((err) => { done(err) })
                            } else {
                                done(null, { saldo: saldo })
                            }

                        }
                    ], (err, sucess) => {

                        if (err)
                            return reject(err)
                        return resolve(sucess.saldo)
                    })
                })


            } else {

                let historico = {
                    valor: notaEntrada.total,
                    valorTotal: 0.00,
                    valorRecebido: 0.00,
                    juro: 0.00,
                    vencimento: notaEntrada.data,
                    //dataPagamento: notaEntrada.data,
                    status: despesa.status,
                    observacao: notaEntrada.observacao,
                    despesaId: despesa.id,
                    usuarioId: notaEntrada.usuarioId
                }

                try {
                    return resolve(await this._model.create(historico, options))
                } catch (err) {
                    return reject(err)
                }
            }


        })



    }
}