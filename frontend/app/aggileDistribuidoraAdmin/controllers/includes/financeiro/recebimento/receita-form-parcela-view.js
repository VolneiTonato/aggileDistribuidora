const utils = require('../../../../../../helpers/utils-admin')



class FinanceiroReceitasFormParcelaView extends Backbone.View {

    constructor() {
        super()

        this.$el = $('body')

        this.overrideEvents()

        this._hashModal = {
            formParcela: ''
        }

        process.nextTick(() => {
            this._model = new (require('../../../models/receita'))()
            return this
        })


    }

    reset() {
        this.$el.off('click', '#block-form-financeiro-contas-a-receber .parcelar-lancamento-historico')
        this.$el.off('click', '#form-parcela-receitas .btn-lancar-parcela-historico')
    }


    overrideEvents() {
        this.reset()


        this.delegateEvents({
            'click #block-form-financeiro-contas-a-receber .parcelar-lancamento-historico': 'formParcelaHistorico',
            'click #form-parcela-receitas .btn-lancar-parcela-historico': 'parcelar'
        })

    }


    async parcelar(e) {
        e.preventDefault()



        let formParcela = this._model.model($(`${this._hashModal.formParcela} #form-parcela-receitas`)).formObject.parcela || {}

        let formHistorico = this._model.model($(`#block-form-financeiro-contas-a-receber #form-financeiro-receita-lancamento-historico`)).formObject.lancamento || {}


        if (formParcela.quantidade === 0 || formParcela.dias === 0)
            return await utils.MessageUtil.alert('É obrigatório informar a quantidade de parcelas e dias para o vencimento!')

        formHistorico.parcela = formParcela

        let [error, data] = await utils.PromiseUtil.to(this._model.saveHistoricoParcelas(formHistorico))
        if (error)
            return await utils.MessageUtil.error(error)

        let conta = await this._model.conta(formHistorico.recebimentoId)

        utils.ModalUtil.forceCloseButton(this._hashModal.formParcela)


        await utils.MessageUtil.alert('Parcelamento realizado com sucesso!', 'success')

        utils.EventUtil.emit('event.financeiro.receita.renderContaBeforeParcela', conta)

    }

    async formParcelaHistorico(e) {
        e.preventDefault()

        let html = await utils.UnderscoreUtil._template('#template-financeiro-receita-lancamento-parcela-form', {})

        let modal = await utils.ModalUtil.modalVTT(html, 'Lançamento de Parcelas', { buttonClose: true, width: '50%' })

        $(modal.element).dialog(modal.config).dialog('open')

        this._hashModal.formParcela = modal.element

    }

}

module.exports = FinanceiroReceitasFormParcelaView