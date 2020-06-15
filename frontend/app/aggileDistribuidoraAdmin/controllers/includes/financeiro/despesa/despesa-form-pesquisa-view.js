const utils = require('../../../../../../helpers/utils-admin')



class FinanceiroDespesasFormPesquisaView extends Backbone.View {

    constructor() {
        super()

        this.$el = $('body')

        this.overrideEvents()

        process.nextTick(() => {
            this._model = new (require('../../../models/despesa'))()
            this.render()
        })


    }

    reset() {
        this.$el.off('click', '#block-list-financeiro-despesa .pesquisar')
        this.$el.off('click', '#block-list-financeiro-despesa .limpar-pesquisa')
        this.$el.off('change', '#block-list-financeiro-despesa #form-pesquisa .pesquisa-tipo-pessoa')
    }


    overrideEvents() {
        this.reset()


        this.delegateEvents({
            'click #block-list-financeiro-despesa .pesquisar': 'pesquisar',
            'click #block-list-financeiro-despesa .limpar-pesquisa': 'limparPesquisa',
            'change #block-list-financeiro-despesa #form-pesquisa .pesquisa-tipo-pessoa': 'changeTipoPessoaAutoCompleteFormPesquisa'
        })

    }


    limparPesquisa(e) {
        e.preventDefault()

        utils.localStorageUtil.removeStorage('ultima_pesquisa_despesas_cadastro')

        new FinanceiroDespesasFormPesquisaView()
    }



    pesquisar(e) {
        e.preventDefault()

        let form = utils.FormUtil.mapObject('#block-list-financeiro-despesa #form-pesquisa')

        utils.localStorageUtil.setStorage('ultima_pesquisa_despesas_cadastro', form.formObject.pesquisa)

        utils.EventUtil.emit('event.financeiro.despesa.carregarDespesaByFormPesquisa', {form: this.getFormPesquisaCache()})

    }


    getFormPesquisaCache() {
        let form = {}

        if (utils.localStorageUtil.isStorageItem('ultima_pesquisa_despesas_cadastro'))
            form = utils.localStorageUtil.getStorage('ultima_pesquisa_despesas_cadastro')

        return form || {}
    }


    changeTipoPessoaAutoCompleteFormPesquisa(e) {
        let type = $(e.currentTarget).val()

        let form = utils.FormUtil.mapObject('#block-list-financeiro-despesa #form-pesquisa')

        if (_.get(form, 'pesquisa')) {
            form.pesquisa.pessoaNome.val('')
            form.pesquisa.pessoaId.val('')
        }



        this.renderAutoCompletePessoaFormPesquisa(type)
    }

    selectTipoPessoaByPessoaFormPesquisa(tipoPessoa) {
        if (!tipoPessoa)
            return false

        let block = $('#block-list-financeiro-despesa #form-pesquisa')



        block.find('.pesquisa-tipo-pessoa:radio').filter((i, item) => {
            $(item).attr('checked', false)
            if ($(item).val() == tipoPessoa)
                $(item).attr({ checked: true })
        })
    }




    renderAutoCompletePessoaFormPesquisa(type, data = {}) {

        let form = this.getFormPesquisaCache()

        $('#block-list-financeiro-despesa #form-pesquisa #inner-pessoa-autocomplete-pesquisa').html('')

        if (!type)
            return false

        if (form.tipoPessoa != type) {
            form.pessoaNome = ''
            form.pessoaId = ''
        }

        utils.UnderscoreUtil._template('#template-geral-autocomplete-pessoa', { data: { title: type, name: _.get(form, 'pessoaNome') } }, '#inner-pessoa-autocomplete-pesquisa')

        utils.AutoCompleteUtil.AutoComplete({
            type: type,
            bloco: '#block-list-financeiro-despesa #form-pesquisa #bloco-autocomplete-pessoa',
            input: 'input[name="pesquisa_pessoaId"]',
            isClearValue: false,
            form: '#block-list-financeiro-despesa #form-pesquisa',
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
                    $('#block-list-financeiro-despesa #form-pesquisa input[name="pesquisa_pessoaNome"]').val(name)

            }

        })
    }

    renderFormPesquisa() {

        let form = this.getFormPesquisaCache()


        utils.UnderscoreUtil._template("#template-form-pesquisa-despesa", { form: form }, '#inner-form-pesquisa-despesa')


        $.when(utils.EstadoMunicipioUtil.municipioSelectBox(
            {
                municipioElement: '#block-list-financeiro-despesa #pesquisa-municipio',
                municipio: form.municipio
            }
        ))

        this.selectTipoPessoaByPessoaFormPesquisa(_.get(form, 'tipoPessoa'))

        this.renderAutoCompletePessoaFormPesquisa(_.get(form, 'tipoPessoa'))

        let select = $('#block-list-financeiro-despesa #form-pesquisa').find('#pesquisa-status')

        utils.ApiUtil.statusRecebimentos().then((status) => {


            select.append(`<option value="">Selecione</option>`)
            select.append(`<option value="all">Todos</option>`)

            status.forEach((item) => {

                select.append(`<option value="${item.value}" ${item.value == form.status ? 'selected' : ''} >${item.text}</option>`)
            })
        })


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

        this.renderForm().catch(err => {
            utils.MessageUtil.message(err, 'danger')
        })

        return this
    }

}

module.exports = FinanceiroDespesasFormPesquisaView