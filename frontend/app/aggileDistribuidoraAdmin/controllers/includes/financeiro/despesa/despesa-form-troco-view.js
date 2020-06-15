const utils = require('../../../../../../helpers/utils-admin')

const emitEventTroco = Symbol('emitEventTroco')

module.exports = class FinanceiroDespesasFormTrocoView extends Backbone.View {

    constructor(troco) {
        super()

        this.$el = $('body')

        this.overrideEvents()

        this._hashModal = {
            form: ''
        }

        process.nextTick(() => {
            this._model = new (require('../../../models/despesa'))()
            this.render(troco)

        })


    }

    reset() {
        this.$el.off('click', '#form-troco-despesas .btn-lancar-troco-historico')
    }


    overrideEvents() {
        this.reset()


        this.delegateEvents({
            'click #form-troco-despesas .btn-lancar-troco-historico': 'lancarTroco'
        })

    }


    [emitEventTroco](troco = {}){
        utils.EventUtil.emit('event.financeiro.despesa.callFormTrocoInformado', { troco})
    }


    async lancarTroco(e) {
        e.preventDefault()

        let troco = utils.NumberUtil.cdbl($(e.currentTarget).closest('#form-troco-despesas').find('input[name=despesa_troco]').val())

        utils.ModalUtil.forceCloseButton(this._hashModal.form)

        this[emitEventTroco](troco)
       

    }

    async formTroco(troco) {

        let html = await utils.UnderscoreUtil._template('#template-financeiro-despesa-lancamento-troco-form', { troco })

        let modal = await utils.ModalUtil.modalVTT(html, 'Lançamento de Troco', {
            buttonClose: false, isCloseX: false, width: '50%'
        })

        /*
        modal.config.buttons = {
            'Fechar': (e) => {
                utils.MessageUtil.closeButton(e)

                this[emitEventTroco](0.00)
            }
        }*/

        $(modal.element).dialog(modal.config).dialog('open')

        this._hashModal.form = modal.element

    }

    render(troco){
        this.formTroco(troco)
        return this
    }

}