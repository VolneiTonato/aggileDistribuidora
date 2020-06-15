const utils = require('../../../../../../helpers/utils-admin')



class FinanceiroAgenciaFormPesquisaView extends Backbone.View {

    constructor() {
        super()

        this.$el = $('body')

        this.overrideEvents()

        process.nextTick(() => {
            this._model = new (require('../../../models/agencia'))(),
            this._agenciaView = require('./agencia-view'),
            this.render()
        })


    }

    reset() {
        this.$el.off('click', '#block-list-financeiro-agencia .pesquisar')
        this.$el.off('click', '#block-list-financeiro-agencia .limpar-pesquisa')
    }


    overrideEvents() {
        this.reset()


        this.delegateEvents({ 
            'click #block-list-financeiro-agencia .pesquisar': 'pesquisar',
            'click #block-list-financeiro-agencia .limpar-pesquisa': 'limparPesquisa',
        })

    }


    limparPesquisa(e){
        e.preventDefault()

        utils.localStorageUtil.removeStorage('ultima_pesquisa_financeiro_agencia_cadastro')

        new FinanceiroAgenciaFormPesquisaView()
    }



    pesquisar(e) {
        e.preventDefault()

        let form = utils.FormUtil.mapObject('#block-list-financeiro-agencia #form-pesquisa')

        utils.localStorageUtil.setStorage('ultima_pesquisa_financeiro_agencia_cadastro', form.formObject.pesquisa)

        utils.EventUtil.emit('event.financeiro.agencia.carregarAgenciaByFormPesquisa', {form : this.getFormPesquisaCache()})

    }


    getFormPesquisaCache() {
        let form = {}

        if (utils.localStorageUtil.isStorageItem('ultima_pesquisa_financeiro_agencia_cadastro'))
            form = utils.localStorageUtil.getStorage('ultima_pesquisa_financeiro_agencia_cadastro')

        return form || {}
    }





    



    renderAutoCompleteAgenciaFormPesquisa(){

        utils.AutoCompleteUtil.AutoComplete({
            type:'agencia',
            bloco: '#block-list-financeiro-agencia #form-pesquisa #bloco-autocomplete-agencia',
            input: 'input[name="pesquisa_id"]',
            isClearValue: false,
            form: '#block-list-financeiro-agencia #form-pesquisa'
        })
    }



    renderAutoCompleteBancoFormPesquisa() {


        utils.AutoCompleteUtil.AutoCompleteIndexDb({

            bloco: '#block-list-financeiro-agencia #form-pesquisa #bloco-autocomplete-banco',
            input: 'input[name="pesquisa_bancoId"]',
            isClearValue: false,
            form: '#block-list-financeiro-agencia #form-pesquisa',
            optionsIndexDb: {
                rows : ['codigo','descricao'],
                database: 'bancos',
                labels: 'descricao',
                template: '#template-autocomplete-bancos',
                primaryKey:'id',
            }
        })
    }


    renderFormPesquisa(options = {}) {

        let form = this.getFormPesquisaCache()


        this.renderAutoCompleteAgenciaFormPesquisa()

        this.renderAutoCompleteBancoFormPesquisa()

        let select = $('#block-list-financeiro-agencia #form-pesquisa').find('#pesquisa-status')

        select.html('<option selected value="">Todos</option>')

        utils.ApiUtil.listBooleanSimNao().forEach(item => {
            select.append(`<option value="${item.value}" ${item.value == utils.StringUtil.stringToBoolean(form.status) && ['true', 'false'].indexOf(form.status) != -1 ? 'selected' : ''} >${item.text}</option>`)
        })

        $.when(utils.EstadoMunicipioUtil.municipioSelectBox(
            {
                municipioElement: '#block-list-financeiro-agencia #pesquisa-endereco-municipio-id',
                municipio: utils.ObjectUtil.getValueProperty(form, 'endereco.municipio.id')
            }
        ))
    }

    async renderForm() {

        try {

            await utils.UnderscoreUtil._template('#template-form-pesquisa-financeiro-agencia', { form: {} }, '#inner-form-pesquisa-financeiro-agencia')

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

module.exports = FinanceiroAgenciaFormPesquisaView