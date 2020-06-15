const utils = require('../../../../../../helpers/utils-admin')

module.exports = class FinanceiroChequeFormDevolucao extends Backbone.View {
    constructor(cheque){
        super()

        this.$el = $('body')


        this._block = {
            form: '#form-devolucao-cheque'
        }

        this._cheque = cheque

        if(['devolvido','depositado','pendente','cancelado'].indexOf(cheque.status) !== -1)
            return utils.MessageUtil.alert(`O cheque com status de '${cheque.status}' não poderá ser devolvido!`,'warning')

        this.overrideEvents()

        process.nextTick(() => {
            this._model = new (require('../../../models/cheque'))(),
            new (require('./cheque-historico-view'))(),
            this.render()
        })

    }


    reset() {
        this.$el.off('click', `${this._block.form} .btn-devolver-cheque`)
    }



    renderAutoCompleteMotivoDevolucao() {


        utils.AutoCompleteUtil.AutoCompleteIndexDb({

            bloco: `${this._block.form} #bloco-autocomplete-motivo-devolucao-cheque`,
            input: 'input[name="motivoDevolucaoId"]',
            isClearValue: true,
            optionsIndexDb: {
                rows : ['codigo','descricao'],
                database: 'motivoDevolucaoCheques',
                labels: 'descricao',
                template: '<p><strong>(<%= codigo  %>) | <%= descricao %></strong></p>',
                primaryKey:'id',
                isTemplate: false
            },
            callback: async (item) => {
                let motivo = item.data

                await utils.UnderscoreUtil._template(
                    '#template-financeiro-cheque-form-devolucao-motivo-selecionado',
                    motivo,
                    '#inner-motivo-devolucao-selecionado'
                )


                this._motivoDevolucaoSelecionado = motivo

                /*

                let target = document.querySelector(`${this._block.form} input[name=motivoDevolucaoId]`)

                if(!target){
                    let input = document.createElement('input')
                    _.assign(input, {name : 'motivoDevolucaoId', value: motivo.codigo, type:'hidden'})
                    document.querySelector(this._block.form).appendChild(input)
                }else{
                    target.value = motivo.codigo
                }*/


            }
        })
    }


    overrideEvents() {
        this.reset()

        this.delegateEvents({
            [`click ${this._block.form} .btn-devolver-cheque`]: 'lancarDevolvido'
        })
    }

    async registerComponenteAutoComplete(){
        await utils.PromiseUtil.sleep()

        let target = document.querySelector(this._block.form)

        
        if(!target)
            this.registerComponenteAutoComplete()
        else
            this.renderAutoCompleteMotivoDevolucao()
    }


    async formDevolucaoCheque() {

        let html = await utils.UnderscoreUtil._template('#template-financeiro-cheque-form-devolucao', {})

        let modal = await utils.ModalUtil.modalVTT(html, '', { buttonClose: true, width: '80%' })

        $(modal.element).dialog(modal.config).dialog('open')


        this._modalInstance = modal.element

        this.registerComponenteAutoComplete()
        
    }

    lancarDevolvido(e){
        e.preventDefault()

        if(!this._motivoDevolucaoSelecionado)
            return utils.MessageUtil.alert('Nenhum motivo selecionado!', 'warning')

        let send = {
            status : 'devolvido',
            motivoDevolucaoId : this._motivoDevolucaoSelecionado.id,
            chequeId : this._cheque.id
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

    render(){

        this.formDevolucaoCheque()

        return this
    }
}