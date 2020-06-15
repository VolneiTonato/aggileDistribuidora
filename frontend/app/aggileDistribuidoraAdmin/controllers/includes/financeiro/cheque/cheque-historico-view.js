const utils = require('../../../../../../helpers/utils-admin')

module.exports = class FinanceiroChequeHistoricoView extends Backbone.View {

    constructor(historicos) {
        super()

        this.$el = $('body')

        this._block = {
            form: '#form-repasse-cheque'
        }

        this._historicoCheque = historicos

        this.overrideEvents()

        process.nextTick(() => {
            this._model = new (require('../../../models/cheque'))(),
                this.render(historicos)
        })
    }

    callHistoricosByEventCheque() {

        utils.EventUtil.on('event.financeiro.chequeHistorico.listarHistoricosByCheque', (data = {}) => {

            this.renderHistoricosEvent(data.historicos, data.element)

        })

    }

    callHistoricosByEventListHistoricos() {
        utils.EventUtil.on('event.financeiro.chequeHistorico.carregarHistoricosByCheque', async (data = {}) => {

            this.carregarData( _.get(data, 'cheque'))
        })
    }

    renderHistoricosEvent(historicos = [], element = '#inner-historicos-cheque') {
        utils.UnderscoreUtil._template('#template-financeiro-cheque-historicos', { historicos }, element)
    }


    carregarData(cheque) {

        if(!_.get(cheque, 'id'))
            return utils.MessageUtil.alert('Cheque obrigatório para a pesquisa de histórico!', 'warning')

        let overlay = $(`${this._block.list} #overlay-painel-list-cadastro`).find('.overlay')

        overlay.show()

        this._model.listAllHistoricos({chequeId : cheque.id}).then((r) => {

            this.renderHistoricosEvent(r)

            overlay.hide()

        }).catch((err) => {
            utils.MessageUtil.error(err)
        })
    }


    reset() {
        //this.$el.off('click', `${this._block.form} #tipo-pessoa-repasse`)
    }




    overrideEvents() {
        this.reset()

        this.delegateEvents({
            //[`change ${this._block.form} #tipo-pessoa-repasse`]: 'changeTipoPessoaAutoComplete'
        })
    }

    render(data) {
        this.callHistoricosByEventCheque()
        this.callHistoricosByEventListHistoricos()

        return this
    }

}