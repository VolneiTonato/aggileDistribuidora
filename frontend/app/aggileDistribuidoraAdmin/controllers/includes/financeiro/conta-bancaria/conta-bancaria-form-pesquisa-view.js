const utils = require('../../../../../../helpers/utils-admin')



class FinanceiroContaBancariaFormPesquisaView extends Backbone.View {

    constructor() {
        super()

        this.$el = $('body')

        this.overrideEvents()

        process.nextTick(() => {
            this._model = new (require('../../../models/conta-bancaria'))(),
                this.render()
        })


    }

    reset() {
        this.$el.off('click', '#block-list-financeiro-conta-bancaria .pesquisar')
        this.$el.off('click', '#block-list-financeiro-conta-bancaria .limpar-pesquisa')
        this.$el.off('change', '#block-list-financeiro-conta-bancaria #form-pesquisa .pesquisa-tipo-pessoa')
    }


    overrideEvents() {
        this.reset()


        this.delegateEvents({
            'click #block-list-financeiro-conta-bancaria .pesquisar': 'pesquisar',
            'click #block-list-financeiro-conta-bancaria .limpar-pesquisa': 'limparPesquisa',
            'change #block-list-financeiro-conta-bancaria #form-pesquisa .pesquisa-tipo-pessoa': 'changeTipoPessoaAutoCompleteFormPesquisa'
        })

    }


    limparPesquisa(e) {
        e.preventDefault()

        utils.localStorageUtil.removeStorage('ultima_pesquisa_financeiro_conta_bancaria_cadastro')

        new FinanceiroContaBancariaFormPesquisaView()
    }



    pesquisar(e) {
        e.preventDefault()

        let form = utils.FormUtil.mapObject('#block-list-financeiro-conta-bancaria #form-pesquisa')

        utils.localStorageUtil.setStorage('ultima_pesquisa_financeiro_conta_bancaria_cadastro', form.formObject.pesquisa)

        utils.EventUtil.emit('event.financeiro.contaBancaria.carregarContaBancariaByFormPesquisa', { form: this.getFormPesquisaCache() })

    }


    getFormPesquisaCache() {
        let form = {}

        if (utils.localStorageUtil.isStorageItem('ultima_pesquisa_financeiro_conta_bancaria_cadastro'))
            form = utils.localStorageUtil.getStorage('ultima_pesquisa_financeiro_conta_bancaria_cadastro')

        return form || {}
    }


    changeTipoPessoaAutoCompleteFormPesquisa(e) {
        let type = $(e.currentTarget).val()

        let form = utils.FormUtil.mapObject('#block-list-financeiro-conta-bancaria #form-pesquisa').formElement

        if (_.get(form, 'pesquisa')) {
            form.pesquisa.pessoaNome.val('')
            form.pesquisa.pessoaId.val('')
        }



        this.renderAutoCompletePessoaFormPesquisa(type)
    }


    renderAutoCompletePessoaFormPesquisa(type, data = {}) {

        let form = this.getFormPesquisaCache()

        $('#block-list-financeiro-conta-bancaria #form-pesquisa #inner-pessoa-autocomplete-pesquisa').html('')

        let formPesquisa = $('#block-list-financeiro-conta-bancaria #form-pesquisa')

       
        

        if (!type)
            return false

        let inputPessoaNome = 'input[name="pesquisa_pessoaNome"]'

        if (formPesquisa.find(inputPessoaNome).length == 0)
            formPesquisa.append(`<input type="hidden" value="" name="pesquisa_pessoaNome" />`)


        formPesquisa.find(inputPessoaNome).val(_.get(form, 'pessoaNome'))

        if (form.tipoPessoa != type) {
            form.pessoaNome = ''
            form.pessoaId = ''
        }

        utils.UnderscoreUtil._template('#template-geral-autocomplete-pessoa', { data: { title: type, name: _.get(form, 'pessoaNome') } }, '#inner-pessoa-autocomplete-pesquisa')

        utils.AutoCompleteUtil.AutoComplete({
            type: type,
            bloco: '#block-list-financeiro-conta-bancaria #form-pesquisa #bloco-autocomplete-pessoa',
            input: 'input[name="pesquisa_pessoaId"]',
            isClearValue: false,
            form: '#block-list-financeiro-conta-bancaria #form-pesquisa',
            callback: (item) => {

                let name = undefined
                let tipoPessoa = _.get(item, 'data.tipoPessoa')

                switch (tipoPessoa) {
                    case 'cliente':
                    case 'fabrica':
                    case 'cedente':
                        name = _.get(item, `data.${tipoPessoa}.razaoSocial`)
                        break
                    case 'vendedor':
                        name = _.get(item, 'data.vendedor.nome')
                        break
                }

                if (name)
                    formPesquisa.find(inputPessoaNome).val(name)

            }

        })
    }

    renderAutoCompleteAgenciaFormPesquisa() {

        let form = this.getFormPesquisaCache()

        let formPesquisa = $('#block-list-financeiro-conta-bancaria #form-pesquisa')

        let inputAgenciaNome = 'input[name="pesquisa_agenciaNome"]'

        if (formPesquisa.find(inputAgenciaNome).length == 0)
            formPesquisa.append(`<input type="hidden" value="" name="pesquisa_agenciaNome" />`)


        formPesquisa.find(inputAgenciaNome).val(_.get(form, 'agenciaNome'))


        $('#block-list-financeiro-conta-bancaria #form-pesquisa #bloco-autocomplete-agencia').val(_.get(form, 'agenciaNome'))


        utils.AutoCompleteUtil.AutoComplete({
            type: 'agencia',
            bloco: '#block-list-financeiro-conta-bancaria #form-pesquisa #bloco-autocomplete-agencia',
            input: 'input[name="pesquisa_pessoaAgenciaId"]',
            isClearValue: false,
            form: '#block-list-financeiro-conta-bancaria #form-pesquisa',
            callback: (item) => {

                let name = _.get(item, 'data.agencia.nome')


                if (name)
                    formPesquisa.find(inputAgenciaNome).val(name)
            }
        })
    }


    selectTipoPessoaByPessoaFormPesquisa(tipoPessoa) {
        if (!tipoPessoa)
            return false

        let block = $('#block-list-financeiro-conta-bancaria #form-pesquisa')



        block.find('.pesquisa-tipo-pessoa:radio').filter((i, item) => {
            $(item).attr('checked', false)
            if ($(item).val() == tipoPessoa)
                $(item).attr({ checked: true })
        })
    }


    renderAutoCompleteBancoFormPesquisa() {


        let form = this.getFormPesquisaCache()

        let formPesquisa = $('#block-list-financeiro-conta-bancaria #form-pesquisa')

        let inputBancoNome = 'input[name="pesquisa_bancoNome"]'

        if (formPesquisa.find(inputBancoNome).length == 0)
            formPesquisa.append(`<input type="hidden" value="" name="pesquisa_bancoNome" />`)


        formPesquisa.find(inputBancoNome).val(_.get(form, 'bancoNome'))


        $('#block-list-financeiro-conta-bancaria #form-pesquisa #bloco-autocomplete-banco').val(_.get(form, 'bancoNome'))


        utils.AutoCompleteUtil.AutoCompleteIndexDb({

            bloco: '#block-list-financeiro-conta-bancaria #form-pesquisa #bloco-autocomplete-banco',
            input: 'input[name="pesquisa_bancoId"]',
            isClearValue: false,
            form: '#block-list-financeiro-conta-bancaria #form-pesquisa',
            optionsIndexDb: {
                rows: ['codigo', 'descricao'],
                database: 'bancos',
                labels: 'descricao',
                template: '#template-autocomplete-bancos',
                primaryKey: 'id',
            },
            callback: (item) => {

                let name = _.get(item, 'data.descricao')


                if (name)
                    formPesquisa.find(inputBancoNome).val(name)
            }
        })
    }


    async renderFormPesquisa(options = {}) {

        let form = this.getFormPesquisaCache()


        await utils.UnderscoreUtil._template('#template-form-pesquisa-financeiro-conta-bancaria', { form: form }, '#inner-form-pesquisa-financeiro-conta-bancaria')

        this.selectTipoPessoaByPessoaFormPesquisa(_.get(form, 'tipoPessoa'))

        this.renderAutoCompletePessoaFormPesquisa(_.get(form, 'tipoPessoa'))

        this.renderAutoCompleteAgenciaFormPesquisa()

        this.renderAutoCompleteBancoFormPesquisa()

        let select = $('#block-list-financeiro-conta-bancaria #form-pesquisa').find('#pesquisa-status')

        select.html('<option selected value="">Todos</option>')

        utils.ApiUtil.listBooleanSimNao().forEach(item => {
            select.append(`<option value="${item.value}" ${item.value == utils.StringUtil.stringToBoolean(form.status) && ['true', 'false'].indexOf(form.status) != -1 ? 'selected' : ''} >${item.text}</option>`)
        })

        $.when(utils.EstadoMunicipioUtil.municipioSelectBox(
            {
                municipioElement: '#block-list-financeiro-conta-bancaria #pesquisa-endereco-municipio-id',
                municipio: utils.ObjectUtil.getValueProperty(form, 'endereco.municipio.id')
            }
        ))
    }

    async renderForm() {

        try {



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

module.exports = FinanceiroContaBancariaFormPesquisaView