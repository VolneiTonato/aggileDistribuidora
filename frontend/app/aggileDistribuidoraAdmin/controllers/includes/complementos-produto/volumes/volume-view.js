const utils = require('../../../../../../helpers/utils-admin')

const cache = {
    cacheModal: null
}

module.exports = class VolumeView extends Backbone.View {

    constructor(volume = {}, options) {
        super()

        this.$el = $('body')


        this._options = options

        this.overrideEvents()

        process.nextTick(() => {
            this._model = new (require('../../../models/volume'))()
            this.render(volume)
        })


    }

    reset() {
        this.$el.off('click', '#block-form-volume #form-cadastro #save')
    }


    overrideEvents() {
        this.reset()


        this.delegateEvents({
            "click #block-form-volume #form-cadastro #save": "save",
        })

    }


    save(e) {
        e.preventDefault()

        this._model.save($('#block-form-volume #form-cadastro')).then((r) => {

            console.log(r)

            utils.MessageUtil.message(r.message, 'info', {
                buttons: {
                    'Fechar': (event) => {
                        utils.MessageUtil.closeButton(event)
                        if (cache.cacheModal)
                            utils.ModalUtil.closeButton(event, cache.cacheModal)


                        if (this._options.eventType == 'edit-lista')
                            utils.EventUtil.emit('event.volume.list.atualizarListaAfterEdit', r.data)
                        else if (this._options.eventType == 'edit-pesquisa-geral')
                            utils.EventUtil.emit('event.volume.form.atualizarListaAfterEdit', r.data)

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
                await utils.UnderscoreUtil._template('#template-children-cadastro-volumes', { form: data })
                , ''
                , { buttonClose: true, width: '50%' }
            )

            cache.cacheModal = modalform.classElement

            $(modalform.element).dialog(modalform.config)


        } catch (err) {
            utils.MessageUtil.error(err)
        }
    }


    render(volume = {}) {
        try {

            this.renderCadastro(volume)

        } catch (err) {
            utils.MessageUtil.message(err, 'danger')
        }
        return this
    }

}