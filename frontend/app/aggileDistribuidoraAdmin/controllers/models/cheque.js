let utils = require('../../../../helpers/utils-admin')

module.exports = class FinanceiroChequeModel extends utils.BackboneModelUtil {

    constructor() {
        super()


    }

    defaults() {

    }


    model(form) {
        return utils.FormUtil.mapObject(form)
    }


    async save(data) {
        this.url = utils.UrlUtil.url(`admin/financeiro/cheques/save`)



        let send = { data: this.model(data).formObject, type: 'POST' }

        return await this.fetch(send)
    }


    async saveHistorico(data, isForm = true) {
        this.url = utils.UrlUtil.url(`admin/financeiro/cheques/save-historico`)

        let send = { data: isForm == true ? this.model(data).formObject : data, type: 'POST' }

        return await this.fetch(send)
    }


    async listAllHistoricos(data = {}) {

        this.url = utils.UrlUtil.url(`admin/financeiro/cheques/list-historicos`)

        let send = { type: 'POST', data: data }

        return await this.fetch(send)

    }


    

    async obterMovimentacaoContasCheque(chequeId, format = 'html'){

        this.url = utils.UrlUtil.url(`reports/cheques/report-cheque-movimentacao-contas/${chequeId}`)

        let send = { type: 'POST', data: {report: {typeFormatReport: format}}}

        return await this.fetch(send)
    }


    async obterValoresLancadosContas(id){

        this.url = utils.UrlUtil.url(`admin/financeiro/cheques/obter-valores-lancados/${id}`)

        let send = { type: 'POST'}

        return await this.fetch(send)
    }


    async listOne(id) {

        this.url = utils.UrlUtil.url(`admin/financeiro/cheques/obter/${id}`)

        let send = { type: 'POST'}

        return await this.fetch(send)
    }

    async listAll(data = {}) {

        _.assign(data, this._paginator)

        this.url = utils.UrlUtil.url(`admin/financeiro/cheques/list`)

        let send = { type: 'POST', data: data }




        let retorno = await this.fetch(send)

        if (_.get(retorno, 'length'))
            this.paginatorCalcule()



        return retorno


    }
}