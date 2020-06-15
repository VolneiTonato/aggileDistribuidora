const utils = require('../../../../../../helpers/utils-admin')



module.exports = class VolumeFormPesquisaView extends Backbone.View {

    constructor() {
        super()

        this.$el = $('body')

        process.nextTick(() => {
            this._model = new (require('../../../models/volume'))()
            this._volumeView = require('./volume-view')
            this.render()
        })


    }


    async autocompleteVolume() {


        utils.AutoCompleteUtil.AutoCompleteIndexDb({

            bloco: '#block-list-volume #form-pesquisa #pesquisa-volume-descricao',
            isClearValue: true,
            form: '#block-list-volume #form-pesquisa',
            optionsIndexDb: {
                rows : ['descricao'],
                database: 'volumes',
                labels: 'descricao',
                template: '#template-autocomplete-volumes',
                primaryKey:'id',
            },
            callback: (item) => {
                new this._volumeView(item.data, {eventType: 'edit-pesquisa-geral'})
            }

        })
    }


    async renderForm() {

        try {

            await utils.UnderscoreUtil._template('#template-volumes-form-pesquisa', { form: {} }, '#inner-form-pesquisa-volumes')

            this.autocompleteVolume()

        } catch (err) {
            utils.MessageUtil.error(err)
        }
    }


    render() {
        try {

            this.renderForm()



        } catch (err) {
            utils.MessageUtil.message(err, 'danger')
        }
        return this
    }

}