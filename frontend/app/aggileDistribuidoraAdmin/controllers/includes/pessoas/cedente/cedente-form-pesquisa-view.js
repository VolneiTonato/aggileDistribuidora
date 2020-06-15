const utils = require('../../../../../../helpers/utils-admin')



module.exports = class CedenteFormPesquisaView extends Backbone.View {

    constructor() {
        super()

        this.$el = $('body')

        this.overrideEvents()

        process.nextTick(() => {
            this._model = new (require('../../../models/cedente'))(),
            this._cedenteView = require('./cedente-view'),
            this.render()
        })


    }

    reset() {
        this.$el.off('click', '#block-list-cedente .pesquisar')
        this.$el.off('click', '#block-list-cedente .limpar-pesquisa')
    }


    overrideEvents() {
        this.reset()


        this.delegateEvents({ 
            'click #block-list-cedente .pesquisar': 'pesquisar',
            'click #block-list-cedente .limpar-pesquisa': 'limparPesquisa',
        })

    }


    limparPesquisa(e){
        e.preventDefault()

        utils.localStorageUtil.removeStorage('ultima_pesquisa_cedente_cadastro')

        new CedenteFormPesquisaView()
    }



    pesquisar(e) {
        e.preventDefault()

        let form = utils.FormUtil.mapObject('#block-list-cedente #form-pesquisa')

        utils.localStorageUtil.setStorage('ultima_pesquisa_cedente_cadastro', form.formObject.pesquisa)

        utils.EventUtil.emit('event.cadastro.pessoa.cedente.carregarCedenteByFormPesquisa', {form : this.getFormPesquisaCache()})

    }


    getFormPesquisaCache() {
        let form = {}

        if (utils.localStorageUtil.isStorageItem('ultima_pesquisa_cedente_cadastro'))
            form = utils.localStorageUtil.getStorage('ultima_pesquisa_cedente_cadastro')

        return form || {}
    }


    renderAutoCompleteCedenteFormPesquisa() {

        utils.AutoCompleteUtil.AutoComplete({
            type:'cedente',
            bloco: '#block-list-cedente #bloco-autocomplete-cedente',
            input: 'input[name="pesquisa_id"]',
            isClearValue: false,
            form: '#block-list-cedente #form-pesquisa'
        })
    }





    renderFormPesquisa(options = {}) {

        let form = this.getFormPesquisaCache()

        this.renderAutoCompleteCedenteFormPesquisa()


        let select = $('#block-list-cedente #form-pesquisa').find('#pesquisa-status')

        select.html('<option selected value="">Todos</option>')

        utils.ApiUtil.listBooleanSimNao().forEach(item => {
            select.append(`<option value="${item.value}" ${item.value == utils.StringUtil.stringToBoolean(form.status) && ['true', 'false'].indexOf(form.status) != -1 ? 'selected' : ''} >${item.text}</option>`)
        })

        $.when(utils.EstadoMunicipioUtil.municipioSelectBox(
            {
                municipioElement: '#block-list-cedente #pesquisa-endereco-municipio-id',
                municipio: utils.ObjectUtil.getValueProperty(form, 'endereco.municipio.id')
            }
        ))
    }

    async renderForm() {

        try {

            await utils.UnderscoreUtil._template('#template-form-pesquisa-cedentes', { form: {} }, '#inner-form-pesquisa-cedente')

            this.renderFormPesquisa()
            

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