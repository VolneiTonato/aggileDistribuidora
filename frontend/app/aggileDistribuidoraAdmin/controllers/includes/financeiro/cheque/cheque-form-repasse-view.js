let utils = require('../../../../../../helpers/utils-admin')

module.exports = class FinanceiroChequeFormRepasse extends Backbone.View {

    constructor(cheque) {

        super()

        this.$el = $('body')


        this._block = {
            form: '#form-repasse-cheque'
        }

        if(['depositado', 'aguardando_depositado','cancelado','repassado', 'repasse_pagamento','recebido'].indexOf(cheque.status) !== -1)
            return utils.MessageUtil.alert(`O cheque com status de '${cheque.status}' não poderá ser repassado!`,'warning')



        this._pessoaSelecionada= null

        this._cheque = cheque

        this.overrideEvents()

        process.nextTick(() => {
            this._model = new (require('../../../models/cheque'))(),
            this.render()
        })
    }


    reset() {
        this.$el.off('click', `${this._block.form} .tipo-pessoa-repasse`)
        this.$el.off('click', `${this._block.form} .btn-repassar-cheque`)
    }




    overrideEvents() {
        this.reset()

        this.delegateEvents({
            [`change ${this._block.form} .tipo-pessoa-repasse`]: 'changeTipoPessoaAutoComplete',
            [`click ${this._block.form} .btn-repassar-cheque`] : 'repassarChequePessoa'
        })
    }




    changeTipoPessoaAutoComplete(e) {
        let type = $(e.currentTarget).val()
        this.renderAutoCompletePessoa(type)
    }

    selectTipoPessoaByPessoa(tipoPessoa) {
        if (!tipoPessoa)
            return false

        let block = $(`${this._block.form} #form-cadastro`)

        block.find('.tipo-pessoa-repasse:radio').filter((i, item) => {
            $(item).attr('checked', false)
            $(item).attr({ 'disabled': true })
            if ($(item).val() == tipoPessoa) {
                $(item).attr({ checked: true })
                block.find('#tipo-emissor').val(tipoPessoa)
            }
        })
    }

    renderAutoCompletePessoa(type) {


        $(`${this._block.form} #inner-pessoa-autocomplete`).html('')


        if (!type)
            return false

        utils.UnderscoreUtil._template('#template-geral-autocomplete-pessoa', { data: { title: type, name: '' } }, `${this._block.form} #inner-pessoa-autocomplete`)

        utils.AutoCompleteUtil.AutoComplete({
            type: type,
            bloco: `${this._block.form} #bloco-autocomplete-pessoa`,
            isClearValue: false,
            parent: this._block.form,
            callback: async (item) => {

                this._pessoaSelecionada = item.data

                await utils.UnderscoreUtil._template('#template-financeiro-cheque-dados-conta-emissor', { form: { pessoa: _.get(item, 'data') }, tipoCadastro : _.get(item, 'data.tipoPessoa') }, `${this._block.form} #inner-dados-conta-emissor`)

                $(`${this._block.form} .box-dados-emissor`).show()
            }

        })
    }


    async repassarChequePessoa(e){
        e.preventDefault()

        if(!this._pessoaSelecionada)
            return await utils.MessageUtil.alert('Nenhuma pessoa selecionada para repasse!', 'warning')

        let send = {
            chequeId : this._cheque.id,
            status : 'repassado',
            pessoaRepasseId: this._pessoaSelecionada.id,
            tipoPessoaRepasse : this._pessoaSelecionada.tipoPessoa
        }


        this._model.saveHistorico(send, false).then(retorno => {

            utils.EventUtil.emit('event.financeiro.cheque.changeStatus', _.get(retorno, 'data.status'))

            utils.EventUtil.emit('event.financeiro.chequeHistorico.carregarHistoricosByCheque', {
                cheque: this._cheque
            })
        }).catch(err => {
            utils.MessageUtil.error(err)
        })

        

        

    }

    async formRepasseCheque() {

        let html = await utils.UnderscoreUtil._template('#template-financeiro-cheque-form-repasse', {})

        let modal = await utils.ModalUtil.modalVTT(html, '', { buttonClose: true, width: '80%' })

        $(modal.element).dialog(modal.config).dialog('open')

    }


    render() {

        this.formRepasseCheque()

        return this
    }
}