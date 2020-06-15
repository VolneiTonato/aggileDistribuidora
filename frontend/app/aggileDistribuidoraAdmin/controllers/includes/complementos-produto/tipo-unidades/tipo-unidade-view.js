const utils = require('../../../../../../helpers/utils-admin')

const cache = {
    cacheModal: null
}

module.exports = class TipoUnidadeView extends Backbone.View {

    constructor(tipoUnidade = {}, options) {
        super()

        this.$el = $('body')


        this._options = options

        this.overrideEvents()

        process.nextTick(() => {
            this._model = new (require('../../../models/tipo-unidade'))()
            this.render(tipoUnidade)
        })


    }

    reset() {
        this.$el.off('click', '#block-form-tipo-unidade #form-cadastro #save')
    }


    overrideEvents() {
        this.reset()


        this.delegateEvents({
            "click #block-form-tipo-unidade #form-cadastro #save": "save",
        })

    }


    save(e) {
        e.preventDefault()

        this._model.save($('#block-form-tipo-unidade #form-cadastro')).then((r) => {

            utils.MessageUtil.message(r.message, 'info', {
                buttons: {
                    'Fechar': (event) => {
                        utils.MessageUtil.closeButton(event)
                        if (cache.cacheModal)
                            utils.ModalUtil.closeButton(event, cache.cacheModal)


                        if (this._options.eventType == 'edit-lista')
                            utils.EventUtil.emit('event.tipoUnidade.list.atualizarListaAfterEdit', r.data)
                        else if (this._options.eventType == 'edit-pesquisa-geral')
                            utils.EventUtil.emit('event.tipoUnidade.form.atualizarListaAfterEdit', r.data)

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
                await utils.UnderscoreUtil._template('#template-children-cadastro-tipos-unidades', { form: data })
                , ''
                , { buttonClose: true, width: '50%' }
            )

            cache.cacheModal = modalform.classElement

            $(modalform.element).dialog(modalform.config)


        } catch (err) {
            utils.MessageUtil.error(err)
        }
    }


    render(tipoUnidade = {}) {
        try {

            this.renderCadastro(tipoUnidade)

        } catch (err) {
            utils.MessageUtil.message(err, 'danger')
        }
        return this
    }

}