const sequelize = require('./entityes/index')
const _ = require('lodash')
const enums = require('./enuns/enum')
const Op = sequelize.Sequelize.Op
const utilModel = require('../extras/utils-model')
const relation = require('./enuns/relation')
const utils = require('../../../helpers/_utils/utils')

let conexao = sequelize.sequelize


const validateHistoricoToUltimo = Symbol('validateHistoricoToUltimo')
const verificarDependeciaCheque = Symbol('verificarDependeciaCheque')

const methodPrivate = {
    validateLastHistorico: Symbol('validateLastHistorico'),
    estonarContasByCheque: Symbol('estonarContasByCheque'),
    verificarDependenciaCheque: Symbol('verificarDependencciaCheque')
}

module.exports = class HistoricoChequeModel {

    constructor() {
        this._model = sequelize.entity.HistoricoCheque

        process.nextTick(() => {
            this._modelCliente = require('./clienteModel')
            this._modelFabrica = require('./fabricaModel')
            this._modelCedente = require('./cedenteModel')
            this._modelVendedor = require('./vendedorModel')
            this._modelMotivoDevolvido = require('./motivoDevolucaoChequeModel')
            this._modelCheque = require('./chequeModel')
            this._historicoDespesa = require('./historicoDespesaModel')
            this._historicoReceita = require('./historicoRecebimentoModel')
        })


    }



    async validarMotivoDevolvido(id) {
        return await new this._modelMotivoDevolvido().findOne({ id: id })
    }

    async validarTipoRepasse(historico = {}) {
        let row = undefined
        let where = { id: historico.pessoaRepasseId }

        switch (historico.tipoPessoaRepasse) {
            case 'fabrica':
                row = await new this._modelFabrica().findOne(where)
                break;
            case 'cliente':
                row = await new this._modelCliente().findOne(where)
                break;
            case 'cedente':
                row = await new this._modelCedente().findOne(where)
                break;

            case 'vendedor':
                row = await new this._modelVendedor().findOne(where)
                break;
        }

        return row == undefined
    }


    async findAllIdsChequeByStatus(status = []) {

        if (!status)
            return []

        if (!_.isArray(status))
            status = [status]


        let statusQuery = enums.EnumStatusCheque.map(status => { return status.value }).filter(item => {
            if (status.indexOf(item) !== -1)
                return item
        })



        let ids = await sequelize.SQ.query(`SELECT cheque_id as chequeId FROM historicos_cheques WHERE id IN(SELECT MAX(id) FROM historicos_cheques GROUP BY cheque_id) AND status IN ('${statusQuery.join("','")}')`,
            { type: sequelize.QueryTypes.SELECT, raw: true }
        )

        if (_.isArray(ids)) {
            ids = ids.map(id => { return id.chequeId })
            return _.uniq(ids)
        }

        return []

    }






    async saveHistoricoInicial(cheque = {}, usuario = {}, options = {}) {
        let data = {
            chequeId: cheque.id,
            status: 'pendente',
            usuarioId: usuario.id
        }

        let historico = utilModel.LoadModelToFormUtil.load(new sequelize.entity.HistoricoCheque(), data)

        return await historico.save(options)
    }

    /**
     * 
     * @param {chequeId, pessoaRepasseId, tipoPessoaRepasse}
     */
    async saveRepasseToContas(data = { observacao, chequeId, pessoaRepasseId, tipoPessoaRepasse, status }, usuario = {}, options = {}) {

        if (['repasse_pagamento', 'recebido'].indexOf(data.status) === -1)
            throw `Status inválido para Repassar/Receber o histórico de Cheque!`

        data.usuarioId = usuario.id

        let historico = utilModel.LoadModelToFormUtil.loadChangeModel(new sequelize.entity.HistoricoCheque(), data)


        await this[methodPrivate.validateLastHistorico](historico).catch(err => { throw err })

        await this[methodPrivate.verificarDependenciaCheque](historico).catch(err => { throw err })

        let save = await historico.save(options)

        return await this.findOne({ id: save.id })

    }

    async saveHistorico(data = {}) {

        let historico = utilModel.LoadModelToFormUtil.load(new sequelize.entity.HistoricoCheque(), data)


        await this[methodPrivate.validateLastHistorico](historico).catch(err => { throw err })


        let save = await conexao.transaction(async transaction => {

            await this[methodPrivate.estonarContasByCheque](historico, { validate: true, transaction: transaction })


            await this[methodPrivate.verificarDependenciaCheque](historico)

            return await historico.save({ validate: true, transaction: transaction })

        })



        return await this.findOne({ id: save.id })
    }


    async findOne(conditions = {}) {

        let where = {
            include: relation().RelationCheque.Historico,
            where: conditions
        }

        return await this._model.findOne(where)
    }




    async findAll(conditions = {}) {
        let where = {
            include: relation().RelationCheque.Historico,
            order: [['id', 'ASC']]
        }

        if (conditions)
            _.assign(where, { where: conditions })


        return await this._model.findAll(where)
    }

    async [methodPrivate.verificarDependenciaCheque](historico) {

        if (['cancelado', 'devolvido'].indexOf(historico.status) !== -1)
            return true


        let cheque = await new this._modelCheque()._model.findOne({ where: { id: historico.chequeId } })


        //para repassar será necessário uma despesa
        //caso houver receita, o status de todas deverão estar como paga


        let lancamentoCheque = await new this._modelCheque().obterValorLancadoContas(historico.chequeId)

        if (!lancamentoCheque)
            return true


        if (cheque.origemLancamento == 'receita') {

            

            if (lancamentoCheque.receitas.length == 0 && ['repasse_pagamento', 'depositado', 'aguardando_depositado'].indexOf(historico.status) !== -1)
                throw `Para lançar o cheque como ${historico.status}, deverá lançar primeiro os recebimentos do cheque!`

            if (['repasse_pagamento', 'depositado', 'aguardando_depositado'].indexOf(historico.status) !== -1) {
                let abertas = _.filter(lancamentoCheque.receitas, (row => {
                    if (['pendente', 'aberta'].indexOf(row.status) !== -1)
                        return row
                }))


                if (abertas.length)
                    throw `Não será permitido repassar para ${historico.status} um cheque que ainda não foi recebido totalmente!`
            }

        }




        /*
        if(historico.status == 'repasse_pagamento' && lancamentoCheque.receitas.length){

            let abertas = _.filter(lancamentoCheque.receitas, (row => {
                if(['pendente','aberta'].indexOf(row.status))
                    return row
            }))

            if(abertas.length)
                throw `Não será permitido repassar para pagamento um cheque que ainda não foi recebido!`
            
        }

        console.log(lancamentoCheque.despesas)

        if(historico.status == 'recebido' && lancamentoCheque.despesas.length){

            let abertas = _.filter(lancamentoCheque.despesas, (row => {
                if(['pendente','aberta'].indexOf(row.status))
                    return row
            }))

            if(abertas.length)
                throw `Não será permitido receber um cheque que já foi repassado!'`
        }
        

        if(historico.pessoaRepasseId > 0 && lancamentoCheque.valorLancadoDespesa > 0){
            
            let idsDespesa = _.filter(lancamentoCheque.despesas, {pessoaId: utils.NumberUtil.cdbl(historico.pessoaRepasseId) })

            let idsReceita = _.filter(lancamentoCheque.receitas, {pessoaId: utils.NumberUtil.cdbl(historico.pessoaRepasseId)})

            let filter = _.filter(_.union(idsDespesa, idsReceita))

            if(!utils.ArrayUtil.length(filter))
                throw `O cheque já está sendo utilizado no lançamento de contas! Não será possível repassa-lo para outra pessoa.`

        }//else if(lancamentoCheque.valorLancadoDespesa > 0)
         //   throw `Já existem lançamento para esse Cheque em outras operações! Não será possível prosseguir.`*/
    }


    async [methodPrivate.estonarContasByCheque](historico, options = {}) {


        if (['cancelado', 'devolvido'].indexOf(historico.status) == -1)
            return true


        await new this._historicoDespesa().estornarPagamentoCheque(historico.chequeId, historico.status, options)

        await new this._historicoReceita().estornarPagamentoCheque(historico.chequeId, historico.status, options)


    }



    async [methodPrivate.validateLastHistorico](historico) {


        let historicos = await this._model.findAll({ where: { chequeId: historico.chequeId }, order: [['id', 'ASC']] })

        let cheque = await new this._modelCheque()._model.findOne({ where: { id: historico.chequeId } })

        if (!historicos)
            throw 'Cheque ainda não possui históricos! Lance o cheque corretamente!'


        let ultimoHistorico = _.last(historicos)

        if (ultimoHistorico.status == 'pendente' && ['aguardando_depositado', 'depositado'].indexOf(historico.status) !== -1)
            throw `O cheque só poderá ser depositado se houver um recebimento!`


        if (cheque.origemLancamento == 'despesa' && ['pendente', 'recebido', 'depositado', 'aguardando_depositado'].indexOf(historico.status) !== -1)
            throw `Não será possível lançar o cheque como ${historico.status}, pois a origem do cheque é de Despesa!`






        if (ultimoHistorico.status == 'cancelado')
            throw 'Cheque já cancelado! Não será permitido fazer novos lançamentos com o mesmo cheque.'

        if (ultimoHistorico.status == 'depositado')
            throw 'Cheque já depositado! Não será permitido fazer novos lançamentos com o mesmo cheque.'


        if (historico.status == 'cancelado' && ['pendente', 'devolvido'].indexOf(ultimoHistorico.status) === -1)
            throw `O cheque só poderá ser cancelado se o status atual estiver como Pendente ou Devolvido!`

        if (ultimoHistorico.status == 'aguardando_depositado' && ['recebido', 'pendente', 'repassado', 'cancelado', 'repasse_pagamento'].indexOf(historico.status) !== -1)
            throw `O Cheque não poderá ser ${historico.status} pois está aguardando depósito via banco!`


        if (ultimoHistorico.status == historico.status)
            throw `A última operação feita é igual a atual. Status Cheque: ${historico.status}`

        if (ultimoHistorico.status == 'repassado' && ['depositado', 'aguardando_depositado', 'pendente', 'recebido', 'repasse_pagamento'].indexOf(historico.status) !== -1)
            throw `O cheque já foi repassado, não será permitido depositar ou alterar para pendente!`

        if (ultimoHistorico.status == 'recebido' && ['depositado', 'pendente'].indexOf(historico.status) !== -1)
            throw `O cheque já foi recebido, não será permitido alterar diretamente para depositado ou alterar para pendente!`

        if (['recebido', 'repasse_pagamento'].indexOf(ultimoHistorico.status) !== -1 && cheque.dataPredatado) {
            let dataInicial = utils.DateUtil.getMoment(cheque.dataPreDatado)
            let dataAtual = utils.DateUtil.getMoment(new Date())

            let diff = Math.abs(parseInt(utils.DateUtil.getInstanceMoment().duration(dataInicial.diff(dataAtual)).asDays()))

            if (isNaN(diff))
                diff = 90

            if (diff > 90)
                throw 'Cheque Vencido!'

        }

        if (historico.status == 'depositado')
            historico.contaBancariaId = ultimoHistorico.contaBancariaId

        if (['aguardando_depositado', 'depositado'].indexOf(historico.status) !== -1 && !historico.contaBancariaId)
            throw 'Conta bancária não informada para a operação!'

        if (historico.status == 'devolvido') {

            let motivo = await this.validarMotivoDevolvido(historico.motivoDevolucaoId)

            if (!motivo)
                throw `Motivo inválido para devolução do cheque!`

        }




        if (['recebido', 'repasse_pagamento', 'repassado'].indexOf(historico.status) !== -1) {
            if (['cliente', 'fabrica', 'cedente', 'vendedor'].indexOf(historico.tipoPessoaRepasse) === -1)
                throw `Para alterar o cheque para ${historico.status}, será necessário informar Cliente/Fábrica/Cedente/Vendedor!`

            let isValid = await this.validarTipoRepasse(historico) == false

            if (isValid === false)
                throw `Pessoa inválida para lançar como ${historico.status}!`

            //} else if (ultimoHistorico.status == 'repassado' && utils.NumberUtil.cdbl(historico.pessoaRepasseId) > 0) {
            // não faz nada
        } else {

            //


            historico.tipoPessoaRepasse = null
            historico.pessoaRepasseId = null

        }

        return historico
    }

}
