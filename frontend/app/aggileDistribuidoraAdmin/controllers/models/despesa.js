let utils = require('../../../../helpers/utils-admin')

module.exports = class ContaPagarModel extends utils.BackboneModelUtil {

    constructor() {
        super()
    }

    defaults() {

    }


    model(form) {
        return utils.FormUtil.mapObject(form)
    }

    async save(data, isForm = true) {
        this.url = utils.UrlUtil.url(`admin/financeiro/contas-a-pagar/save`)

        let send = { data: isForm ? this.model(data).formObject : data, type: 'POST' }

        return await this.fetch(send)
    }


    async conta(id) {



        this.url = utils.UrlUtil.url(`admin/financeiro/contas-a-pagar/obter-conta`)

        let send = { data: { id: id }, type: 'POST' }

        return await this.fetch(send)
    }

    async pagamentoTotal(data) {

        this.url = utils.UrlUtil.url(`admin/financeiro/contas-a-pagar/pagamento-total`)

        let send = { data: data, type: 'POST' }

        return await this.fetch(send)
    }


    async pagamento(data) {

        this.url = utils.UrlUtil.url(`admin/financeiro/contas-a-pagar/pagamento`)

        let send = { data: data, type: 'POST' }

        return await this.fetch(send)
    }

    async listAllHistoricos(despesaId) {
        this.url = utils.UrlUtil.url(`admin/financeiro/contas-a-pagar/list-historicos-by-despesa`)

        let send = { data: { despesaId: despesaId }, type: 'GET' }

        return await this.fetch(send)
    }

    async saveHistorico(data) {
        this.url = utils.UrlUtil.url(`admin/financeiro/contas-a-pagar/save-historico`)

        let send = { data: data, type: 'POST' }

        return await this.fetch(send)
    }

    async saveHistoricoParcelas(data) {
        this.url = utils.UrlUtil.url(`admin/financeiro/contas-a-pagar/save-historico-parcela`)

        let send = { data: data, type: 'POST' }

        return await this.fetch(send)
    }

    async cancelarDespesa(data) {
        this.url = utils.UrlUtil.url(`admin/financeiro/contas-a-pagar/cancelar-despesa`)

        let send = { data: data, type: 'POST' }

        return await this.fetch(send)
    }

    async findAllDespesas(data) {

        _.assign(data, this._paginator)

        this.url = utils.UrlUtil.url(`admin/financeiro/contas-a-pagar/listar-despesas`)

        let send = { type: 'POST', data: data }


        try {
            let retorno = await this.fetch(send)

            if (retorno.length > 0)
                this.paginatorCalcule()


            return retorno

        } catch (err) {
            throw err
        }
    }
}