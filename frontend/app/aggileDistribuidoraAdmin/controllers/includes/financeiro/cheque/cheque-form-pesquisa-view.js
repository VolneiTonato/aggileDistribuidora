const utils = require('../../../../../../helpers/utils-admin')



module.exports = class FinanceiroChequeFormPesquisaView extends Backbone.View {

    constructor(options = {}) {
        super()

        this.$el = $('body')

        this._block = {
            list : '#block-list-financeiro-cheque'
        }

        if(options.block)
            this._block.list = options.block

        this.overrideEvents()



        process.nextTick(() => {
            this._model = new (require('../../../models/cheque'))(),
            this._chequeView = require('./cheque-view'),
            this.render()
        })


    }

    reset() {
        this.$el.off('click', `${this._block.list} .pesquisar`)
        this.$el.off('click', `${this._block.list} .limpar-pesquisa`)
        this.$el.off('change', `${this._block.list} .pesquisa-tipo-emissor`)
    }


    overrideEvents() {
        this.reset()


        this.delegateEvents({ 
            [`click ${this._block.list} .pesquisar`]: 'pesquisar',
            [`click ${this._block.list} .limpar-pesquisa`]: 'limparPesquisa',
            [`change ${this._block.list} .pesquisa-tipo-emissor`] : 'changeTipoEmissorAutoCompleteFormPesquisa'
        })

    }


    limparPesquisa(e){
        e.preventDefault()

        utils.localStorageUtil.removeStorage('ultima_pesquisa_financeiro_cheque_cadastro')

        new FinanceiroChequeFormPesquisaView()
    }



    pesquisar(e) {
        e.preventDefault()

        let form = utils.FormUtil.mapObject(`${this._block.list} #form-pesquisa`)

        utils.localStorageUtil.setStorage('ultima_pesquisa_financeiro_cheque_cadastro', form.formObject.pesquisa)

        utils.EventUtil.emit('event.financeiro.cheque.carregarChequeByFormPesquisa', {form : this.getFormPesquisaCache()})

    }


    getFormPesquisaCache() {
        let form = {}

        if (utils.localStorageUtil.isStorageItem('ultima_pesquisa_financeiro_cheque_cadastro'))
            form = utils.localStorageUtil.getStorage('ultima_pesquisa_financeiro_cheque_cadastro')

        return form || {}
    }


    selectTipoEmissorByPessoaFormPesquisa(tipoPessoa) {
        if (!tipoPessoa)
            return false

        let block = $(`${this._block.list} #form-pesquisa`)



        block.find('.pesquisa-tipo-emissor:radio').filter((i, item) => {
            $(item).attr('checked', false)
            if ($(item).val() == tipoPessoa)
                $(item).attr({ checked: true })
        })
    }

    changeTipoEmissorAutoCompleteFormPesquisa(e) {
        let type = $(e.currentTarget).val()


        this.renderAutoCompletePessoaFormPesquisa(type)
    }


    renderAutoCompletePessoaFormPesquisa(type) {

        let form = this.getFormPesquisaCache()

        $(`${this._block.list} #form-pesquisa #inner-pessoa-autocomplete-pesquisa`).html('')

        let formPesquisa = $(`${this._block.list} #form-pesquisa`)
       

        if (!type)
            return false

        utils.FormUtil.createElementInput(formPesquisa, 'pesquisa_emissorNome',_.get(form, 'emissorNome'),'hidden')


        if (form.tipoEmissor != type) {
            form.emissorNome = ''
            form.emissorId = ''
        }

        utils.UnderscoreUtil._template('#template-geral-autocomplete-pessoa', { data: { title: type, name: _.get(form, 'emissorNome') } }, `${this._block.list} #inner-pessoa-autocomplete-pesquisa`)

        utils.AutoCompleteUtil.AutoComplete({
            type: type,
            bloco: `${this._block.list} #form-pesquisa #bloco-autocomplete-pessoa`,
            input: 'input[name="pesquisa_emissorId"]',
            isClearValue: false,
            form: `${this._block.list} #form-pesquisa`,
            callback: (item) => {

                let name = _.get(item, 'data.nome')

                if (name)
                    formPesquisa.find(`input[name="pesquisa_emissorNome"]`).val(name)

            }

        })


        if (_.get(form, 'emissorId')) 
            $(`${this._block.list} #form-pesquisa #bloco-autocomplete-pessoa`).val(`${_.get(form, 'emissorNome')}`)
        
    }
    



    renderAutoCompleteContaBancaria(form = {}) {

        let formPesquisa = $(`${this._block.list} #form-pesquisa`)

        utils.FormUtil.createElementInput(formPesquisa, 'pesquisa_contaBancariaNome',_.get(form, 'contaBancariaNome'),'hidden')

        utils.AutoCompleteUtil.AutoComplete({
            type: 'conta-bancaria',
            bloco: `${this._block.list} #bloco-autocomplete-conta-bancaria`,
            input: 'input[name="pesquisa_contaBancariaId"]',
            isClearValue: false,
            form: `${this._block.list} #form-pesquisa`,
            callback: (item) => {

                let name = [`${_.get(item, 'data.pessoaAgencia.agencia.numero')}`,
                `${_.get(item, 'data.pessoaAgencia.agencia.banco.codigo')}`, `${_.get(item, 'data.titular')}`
                ].join(' - ')

                if (name)
                    formPesquisa.find('input[name="pesquisa_contaBancariaNome"]').val(name)
            }
        })


        if (_.get(form, 'contaBancariaNome')) 
            $(`${this._block.list} #form-pesquisa #bloco-autocomplete-conta-bancaria`).val(_.get(form, 'contaBancariaNome'))
    
    }



    renderAutoCompleteBancoFormPesquisa(form = {}) {


        let formPesquisa = $(`${this._block.list} #form-pesquisa`)

        utils.FormUtil.createElementInput(formPesquisa, 'pesquisa_bancoNome',_.get(form, 'bancoNome'),'hidden')


        utils.AutoCompleteUtil.AutoCompleteIndexDb({

            bloco: `${this._block.list} #form-pesquisa #bloco-autocomplete-banco`,
            input: 'input[name="pesquisa_bancoId"]',
            isClearValue: false,
            form: `${this._block.list} #form-pesquisa`,
            optionsIndexDb: {
                rows : ['codigo','descricao'],
                database: 'bancos',
                labels: 'descricao',
                template: '#template-autocomplete-bancos',
                primaryKey:'id',
            },
            callback: (item) => {
                let name = _.get(item, 'data.descricao')

                if (name)
                    formPesquisa.find(`input[name="pesquisa_bancoNome"]`).val(name)
            }
        })

        if (_.get(form, 'bancoNome')) 
            $(`${this._block.list} #form-pesquisa #bloco-autocomplete-banco`).val(_.get(form, 'bancoNome'))
        
    }


    renderFormPesquisa(form = {}) {

        


        this.selectTipoEmissorByPessoaFormPesquisa(_.get(form, 'tipoEmissor'))

        this.renderAutoCompletePessoaFormPesquisa(_.get(form, 'tipoEmissor'))

        this.renderAutoCompleteContaBancaria(form)

        this.renderAutoCompleteBancoFormPesquisa(form)

        utils.ApiUtil.statusCheque().then((status) => {

            let select = $(`${this._block.list} #form-pesquisa`).find('#pesquisa-status')
            select.html(`<option value="">Selecione</option>`)
            select.append(`<option value="all">Todos</option>`)

            status.forEach((item) => {
                select.append(`<option value="${item.value}" ${item.value == form.status ? 'selected' : ''} >${item.text}</option>`)
            })
        })
    }

    async renderForm() {

        try {

            let form = this.getFormPesquisaCache()

            await utils.UnderscoreUtil._template('#template-form-pesquisa-financeiro-cheque', { form: form }, '#inner-form-pesquisa-financeiro-cheque')

            this.renderFormPesquisa(form)


            

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