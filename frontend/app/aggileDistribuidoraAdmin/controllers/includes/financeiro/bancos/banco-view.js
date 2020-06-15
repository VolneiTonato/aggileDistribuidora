const utils = require('../../../../../../helpers/utils-admin')

const cache = {
    cacheModal: null
}

class FinanceiroBancoView extends Backbone.View {

    constructor(banco = {}, options) {
        super()

        this.$el = $('body')


        this._options = options

        this.overrideEvents()

        process.nextTick(() => {
            this._model = new (require('../../../models/banco'))(),
                this.render(banco)
        })


    }

    reset() {
        this.$el.off('click', '#block-form-financeiro-bancos #form-cadastro #save')
    }


    overrideEvents() {
        this.reset()


        this.delegateEvents({
            "click #block-form-financeiro-bancos #form-cadastro #save": "save",
        })

    }


    save(e) {
        e.preventDefault()

        this._model.save($('#block-form-financeiro-bancos #form-cadastro')).then((r) => {

            utils.MessageUtil.message(r.message, 'info', {
                buttons: {
                    'Fechar': (event) => {
                        utils.MessageUtil.closeButton(event)
                        if (cache.cacheModal)
                            utils.ModalUtil.closeButton(event, cache.cacheModal)


                        if(this._options.eventType == 'edit-lista')
                            utils.EventUtil.emit('event.financeiro.list.atualizarListaAfterEdit', r.data)
                        else if(this._options.eventType == 'edit-pesquisa-geral')
                            utils.EventUtil.emit('event.financeiro.form.atualizarListaAfterEdit', r.data)




                        this.renderCadastro(r.data)
                    }
                }
            })
        }).catch((err) => {
            utils.MessageUtil.error(err)
        })


    }


    async renderCadastro(data = {}) {

        try {


            let modalform = await utils.ModalUtil.modalVTT(
                await utils.UnderscoreUtil._template('#template-children-cadastro-financeiro-bancos', { form: data })
                , ''
                , { buttonClose: true, width: '50%' }
            )

            cache.cacheModal = modalform.classElement

            $(modalform.element).dialog(modalform.config)


        } catch (err) {
            utils.MessageUtil.error(err)
        }
    }


    render(grupo = {}) {
        try {

            this.renderCadastro(grupo)

        } catch (err) {
            utils.MessageUtil.message(err, 'danger')
        }
        return this
    }

}

module.exports = FinanceiroBancoView