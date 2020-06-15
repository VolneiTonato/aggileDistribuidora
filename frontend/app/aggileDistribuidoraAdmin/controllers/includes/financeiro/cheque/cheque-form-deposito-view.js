const utils = require('../../../../../../helpers/utils-admin')

module.exports = class FinanceiroChequeFormDepostio extends Backbone.View {

    constructor(cheque) {

        super()

        this.$el = $('body')


        this._block = {
            form: '#form-deposito-cheque'
        }

        this._cheque = cheque

        this.overrideEvents()

        process.nextTick(() => {
            this._model = new (require('../../../models/cheque'))(),
                new (require('./cheque-historico-view'))(),
                this.render()
        })
    }


    reset() {
        this.$el.off('click', `${this._block.form} .btn-depositar-cheque`)
    }




    overrideEvents() {
        this.reset()

        this.delegateEvents({
            [`click ${this._block.form} .btn-depositar-cheque`]: 'lancarParaDeposito'
        })
    }

    renderAutoCompleteContaBancaria() {

        utils.AutoCompleteUtil.AutoComplete({
            type: 'conta-bancaria',
            bloco: `${this._block.form} #bloco-autocomplete-conta-bancaria`,
            isClearValue: false,
            form: `${this._block.form}`,
            callback: async (item) => {
                this._contaSelecionada = item.data
                await utils.UnderscoreUtil._template('#template-financeiro-cheque-dados-conta-bancaria-agencia', { form: item.data }, `${this._block.form} #inner-dados-conta-bancaria-agencia`)
                await utils.UnderscoreUtil._template('#template-financeiro-cheque-dados-conta-pessoa', { form: item.data }, `${this._block.form} #inner-dados-conta-pessoa`)
            }
        })
    }


    async lancarParaDeposito(e) {
        e.preventDefault()

        if (!this._contaSelecionada)
            return await utils.MessageUtil.alert('Nenhuma conta selecionada para depósito!', 'warning')

        let send = {
            chequeId: this._cheque.id,
            status: 'aguardando_depositado',
            contaBancariaId: this._contaSelecionada.id
        }

        this._model.saveHistorico(send, false).then(retorno => {

            utils.EventUtil.emit('event.financeiro.cheque.changeStatus', _.get(retorno, 'data.status'))

            utils.EventUtil.emit('event.financeiro.chequeHistorico.carregarHistoricosByCheque', {
                cheque: this._cheque
            })
            utils.ModalUtil.forceCloseButton(this._modalInstance)
        }).catch(err => {
            utils.MessageUtil.error(err)
        })

    }

    async registerComponentAutocomplete() {
        await utils.PromiseUtil.sleep()

        let target = document.querySelector(this._block.form)

        if (!target)
            await this.registerComponentAutocomplete()
        else
            await this.renderAutoCompleteContaBancaria()

    }


    async formDepositoCheque() {

        let html = await utils.UnderscoreUtil._template('#template-financeiro-cheque-form-deposito', {})

        let modal = await utils.ModalUtil.modalVTT(html, '', { buttonClose: true, width: '80%' })

        $(modal.element).dialog(modal.config).dialog('open')


        this._modalInstance = modal.element

        this.registerComponentAutocomplete()


    }


    async marcarComoDepositado() {
        let run = () => {

            let send = {
                chequeId: this._cheque.id,
                status: 'depositado'
            }

            this._model.saveHistorico(send, false).then((retorno) => {

                utils.EventUtil.emit('event.financeiro.cheque.changeStatus', _.get(retorno, 'data.status'))

                utils.EventUtil.emit('event.financeiro.chequeHistorico.carregarHistoricosByCheque', {
                    cheque: this._cheque
                })

            }).catch((err) => {
                utils.MessageUtil.error(err)
            })
        }

        let question = {
            buttons: {
                'Sim': (e) => {
                    run()
                    utils.MessageUtil.closeButton(e)
                },
                'Fechar': (e) => {
                    utils.MessageUtil.closeButton(e)
                }
            }
        }

        utils.MessageUtil.message('Deseja marcar este cheque como Depositado?', 'warning', question)

    }

    validateStatus(){
        if(['depositado','cancelado','repassado','repasse_pagamento'].indexOf(_.get(this._cheque, 'status')) !== -1){
            utils.MessageUtil.alert(`O cheque com status de '${_.get(this._cheque, 'status')}' não poderá ser depositado!`,'warning')
            return false
        }
        return true
        
    }


    render() {

        if (!this._cheque)
            return utils.MessageUtil.alert('Nenhum cheque Selecionado!')
        
        if(!this.validateStatus())
            return false

        if (_.get(this._cheque, 'status') == 'aguardando_depositado') {
            this.marcarComoDepositado()
        } else {
            this.formDepositoCheque()
        }

        return this
    }
}