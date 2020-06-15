const utils = require('../../../../../../helpers/utils-admin')

const methodPrivate = {
    regraNegocioBotaoView: Symbol('regraNegocioBotaoView'),
    renderModalView: Symbol('renderModalView'),
    listMovimentacaoContasCheque: Symbol('listMovimentacaoContasCheque')
}



class FinanceiroChequeMovimentacaoView extends Backbone.View {

    constructor(block) {

        super()

        this._cheque = null
        this._block = null

        this.$el = $('body')

        process.nextTick(() => {
            this._model = new (require('../../../models/cheque'))()
            this.render()
        })
    }

    async [methodPrivate.listMovimentacaoContasCheque]() {

        if (!_.get(this._cheque, 'id'))
            await utils.MessageUtil.alert('Nenhum cheque selecionando!', 'warning')

        $(this._block.btn).addClass('disabled')

        this._model.obterMovimentacaoContasCheque(this._cheque.id).then(retorno => {

            $(this._block.btn).removeClass("disabled")

            this[methodPrivate.renderModalView](retorno.key)

        }).catch(err => {

            $(this._block.btn).removeClass("disabled")
            utils.MessageUtil.error(err)
        })
    }

    async [methodPrivate.renderModalView](key) {
        let modal = await utils.ModalUtil.modalVTT(``, 'Histórico Movimentação Cheque', { iframe: {
            src: `/reports/generate-report-iframe/${key}`,
            width: '100%',
            height: window.innerHeight
        }, buttonClose: true, width: '100%' })

        $(modal.element).dialog(modal.config)//.dialog('open')
    }


    render() {
        return this
    }
}


class FinanceiroChequeMovimentacaoFormView extends FinanceiroChequeMovimentacaoView {
    constructor(cheque) {

        super()

        this.$el = $('body')

        this._block = {
            btn: '#block-form-financeiro-cheque .consultar-movimentacao-cheque-detalhado',
        }

        this._cheque = cheque

        this.overrideEvents()


        this.render()

    }


    reset() {
        this.$el.off('click', `${this._block.btn}`)
    }




    overrideEvents() {
        this.reset()

        this.delegateEvents({
            [`click ${this._block.btn}`]: 'movimentacaoCheque',
        })
    }

    async movimentacaoCheque(e) {
        e.preventDefault()

        await this[methodPrivate.listMovimentacaoContasCheque]()

    }


    render() {

        if (!_.get(this._cheque, 'id'))
            $(this._block.btn).addClass('disabled')
        else
            $(this._block.btn).removeClass("disabled")

        return this
    }


}


class FinanceiroChequeMovimentacaoListView extends FinanceiroChequeMovimentacaoView {

    constructor() {

        super()

        this.$el = $('body')


        this._block = {
            btn: '#block-list-financeiro-cheque .consultar-movimentacao-cheque-detalhado'
        }

        this.overrideEvents()

        this.render()

    }

    reset() {
        this.$el.off('click', `${this._block.btn}`)
    }




    overrideEvents() {
        this.reset()

        this.delegateEvents({
            [`click ${this._block.btn}`]: 'movimentacaoCheque',
        })
    }


    async movimentacaoCheque(e) {
        e.preventDefault()

        this._cheque = utils.JsonUtil.toParse($(e.currentTarget).closest('.row-item-list').attr('data-item'))

        await this[methodPrivate.listMovimentacaoContasCheque]()

    }

    render() {

        if ($(this._block.btn).length > 0)
            $(this._block.btn).removeClass("disabled")

        return this
    }


}


module.exports = {
    FinanceiroChequeMovimentacaoListView: FinanceiroChequeMovimentacaoListView,
    FinanceiroChequeMovimentacaoFormView: FinanceiroChequeMovimentacaoFormView
}