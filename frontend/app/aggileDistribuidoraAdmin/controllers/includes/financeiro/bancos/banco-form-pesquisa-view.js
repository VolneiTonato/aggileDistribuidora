const utils = require('../../../../../../helpers/utils-admin')



class FinanceiroBancoFormPesquisaView extends Backbone.View {

    constructor() {
        super()



        this.$el = $('body')

        //this.overrideEvents()

        process.nextTick(() => {
            this._model = new (require('../../../models/banco'))(),
            this._bancoView = require('./banco-view'),
            this.render()
        })


    }

    reset() {

    }


    overrideEvents() {
        this.reset()


        this.delegateEvents({ })

    }



    async autocompleteBanco() {


        utils.AutoCompleteUtil.AutoCompleteIndexDb({

            bloco: '#block-list-financeiro-banco #form-pesquisa #pesquisa-banco-descricao',
            //input: 'input[name="pesquisa_bancoId"]',
            isClearValue: true,
            form: '#block-list-financeiro-banco #form-pesquisa',
            optionsIndexDb: {
                rows : ['codigo','descricao'],
                database: 'bancos',
                labels: 'descricao',
                template: '#template-autocomplete-bancos',
                primaryKey:'id',
            },
            callback: (item) => {
                new this._bancoView(item.data, {eventType: 'edit-pesquisa-geral'})
            }

        })
    }


    async renderForm() {

        try {

            await utils.UnderscoreUtil._template('#template-financeiro-bancos-form-pesquisa', { form: {} }, '#inner-form-pesquisa-financeiro-bancos')

            this.autocompleteBanco()

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

module.exports = FinanceiroBancoFormPesquisaView