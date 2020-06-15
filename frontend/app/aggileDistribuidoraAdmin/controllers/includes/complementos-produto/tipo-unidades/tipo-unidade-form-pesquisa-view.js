const utils = require('../../../../../../helpers/utils-admin')



module.exports = class VolumeFormPesquisaView extends Backbone.View {

    constructor() {
        super()

        this.$el = $('body')

        process.nextTick(() => {
            this._model = new (require('../../../models/volume'))()
            this._tipoUnidadeView = require('./tipo-unidade-view')
            this.render()
        })


    }


    async autocompleteVolume() {


        utils.AutoCompleteUtil.AutoCompleteIndexDb({

            bloco: '#block-list-tipo-unidade #form-pesquisa #pesquisa-tipo-unidade-descricao',
            isClearValue: true,
            form: '#block-list-tipo-unidade #form-pesquisa',
            optionsIndexDb: {
                rows : ['descricao'],
                database: 'tiposUnidade',
                labels: 'descricao',
                template: '#template-autocomplete-tipos-unidades',
                primaryKey:'id',
            },
            callback: (item) => {
                new this._tipoUnidadeView(item.data, {eventType: 'edit-pesquisa-geral'})
            }

        })
    }


    async renderForm() {

        try {

            await utils.UnderscoreUtil._template('#template-tipos-unidade-form-pesquisa', { form: {} }, '#inner-form-pesquisa-tipo-unidade')

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