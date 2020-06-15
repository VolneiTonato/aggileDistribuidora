
let utils = require('../../../../helpers/utils-admin')

module.exports = class ContaReceberModel extends utils.BackboneModelUtil {

    constructor() {
        super()
    }

    defaults() {

    }


    model(form) {
        return utils.FormUtil.mapObject(form)
    }

    async save(data, isForm = true) {
        this.url = utils.UrlUtil.url(`admin/financeiro/contas-a-receber/save`)

        let send = { data: isForm ? this.model(data).formObject : data, type: 'POST' }

        return await this.fetch(send)
    }


    async conta(id) {

        this.url = utils.UrlUtil.url(`admin/financeiro/contas-a-receber/obter-conta`)

        let send = { data: { id: id }, type: 'POST' }

        return await this.fetch(send)
    }

    async recebimentoTotal(id) {

        this.url = utils.UrlUtil.url(`admin/financeiro/contas-a-receber/recebimento-total`)

        let send = { data: {id: id}, type: 'POST' }

        return await this.fetch(send)
    }


    async recebimento(data) {

        this.url = utils.UrlUtil.url(`admin/financeiro/contas-a-receber/recebimento`)

        let send = { data: data, type: 'POST' }

        return await this.fetch(send)
    }

    async listAllHistoricos(recebimentoId) {
        this.url = utils.UrlUtil.url(`admin/financeiro/contas-a-receber/list-historicos-by-recebimento`)

        let send = { data: { recebimentoId: recebimentoId }, type: 'GET' }

        return await this.fetch(send)
    }

    async saveHistorico(data) {
        this.url = utils.UrlUtil.url(`admin/financeiro/contas-a-receber/save-historico`)

        let send = { data: data, type: 'POST' }

        return await this.fetch(send)
    }

    async saveHistoricoParcelas(data) {
        this.url = utils.UrlUtil.url(`admin/financeiro/contas-a-receber/save-historico-parcela`)

        let send = { data: data, type: 'POST' }

        return await this.fetch(send)
    }

    async cancelarReceita(data) {
        this.url = utils.UrlUtil.url(`admin/financeiro/contas-a-receber/cancelar-receita`)

        let send = { data: data, type: 'POST' }

        return await this.fetch(send)
    }

    async findAllReceitas(data) {

        _.assign(data, this._paginator)

        this.url = utils.UrlUtil.url(`admin/financeiro/contas-a-receber/listar-receitas`)

        let send = { type: 'POST', data: data }


        try {
            let retorno = await this.fetch(send)

            if (retorno && (retorno.length > 0))
                this.paginatorCalcule()


            return retorno

        } catch (err) {
            throw err
        }
    }
}