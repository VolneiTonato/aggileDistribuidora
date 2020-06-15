const utils = require('../../../../../../helpers/utils-admin')

const methodPrivate = {
    questionMethod: Symbol('questionMethod')
}

module.exports = class FinanceiroChequeFormCancelamento extends Backbone.View {

    constructor(cheque) {

        super()

        this.$el = $('body')


        this._block = {
            btn: '.btn-cancelar-cheque'
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
        this.$el.off('click', `${this._block.btn}`)
    }




    overrideEvents() {
        this.reset()

        this.delegateEvents({
            [`click ${this._block.btn}`]: 'cancelarCheque'
        })

        this.callEventCancelarByCheque()
    }


    validateStatus() {
        if (['repassado', 'depositado', 'aguardando_depositado', 'cancelado'].indexOf(_.get(this._cheque, 'status')) !== -1) {
            utils.MessageUtil.alert(`O cheque com status de '${_.get(this._cheque, 'status')}' não poderá ser cancelado!`, 'warning')
            return false
        }
        return true
    }


    async [methodPrivate.questionMethod]() {

        return new Promise(async (resolve, reject) => {

            let message = await utils.MessageUtil.messageVTT(`Deseja cancelar o cheque ${_.get(this._cheque, 'numero')}?`, 'warning')

            _.extend(message.config, {
                buttons: {
                    'Sim': function () {
                        resolve(true)
                        $(this).dialog("close");
                    },
                    'Não': function () {
                        resolve(false)
                        $(this).dialog("close");
                    }
                }
            })


            $(message.element).dialog(message.config).dialog('open')
            
        })

    }

    callEventCancelarByCheque() {
        utils.EventUtil.on('event.financeiro.chequeCancelamento.cancelarByCheque', async (cheque) => {

            this._cheque = cheque

            if (!this.validateStatus())
                return false

            if(await this[methodPrivate.questionMethod]() == false)
                return false

            let send = {
                chequeId: _.get(cheque, 'id'),
                status: 'cancelado'
            }

            this._model.saveHistorico(send, false).then(retorno => {

                utils.EventUtil.emit('event.financeiro.cheque.changeStatus', _.get(retorno, 'data.status'))

                utils.EventUtil.emit('event.financeiro.chequeHistorico.carregarHistoricosByCheque', {
                    cheque: this._cheque
                })
            }).catch(err => {
                utils.MessageUtil.error(err)
            })



        })
    }




    async cancelarCheque(e) {
        e.preventDefault()



        if (!this._cheque)
            return await utils.MessageUtil.alert('Nenhum cheque selecionando!', 'warning')

        if (!this.validateStatus())
            return false

        let send = {
            chequeId: this._cheque.id,
            status: 'cancelado'
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


    render() {

        return this
    }
}