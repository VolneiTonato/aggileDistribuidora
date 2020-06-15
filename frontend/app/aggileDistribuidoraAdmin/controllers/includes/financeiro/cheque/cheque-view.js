let utils = require('../../../../../../helpers/utils-admin')


const viewUrl = Symbol('viewUrl')

module.exports = class FinanceiroChequeView extends Backbone.View {

    constructor(cheque = {}, options = {}) {
        super()

        this._bread = new utils.BreadCrumb()

        this.breadCrumbs()

        this._pathUrl = Backbone.history.getFragment()

        this.$el = $('body')


        this._block = {
            form: '#block-form-financeiro-cheque'
        }

        this.overrideEvents()

        process.nextTick(() => {
            this._model = new (require('../../../models/cheque'))()
            this._historicoCheque = new (require('./cheque-historico-view'))()
            this._formRepasse = require('./cheque-form-repasse-view')
            this._formDepositar = require('./cheque-form-deposito-view')
            this._formDevolucao = require('./cheque-form-devolucao-view')
            this._formCancelar = new (require('./cheque-form-cancelar-view'))()
            this._movimentacaoChequeView = require('./cheque-movimentacao-view')
            this.render(cheque, options)
        })


    }

    breadCrumbs() {
        this._bread.add('inicio', '#home')
            .add('Cheques', '#financeiro/cadastro-de-cheques/pesquisa')
    }

    reset() {
        this.$el.off('click', `${this._block.form} #form-cadastro #save`)
        this.$el.off('change', `${this._block.form} #form-cadastro .tipo-emissor-form`)
        this.$el.off('click', `${this._block.form} #form-cadastro #repassar-cheque`)
        this.$el.off('click', `${this._block.form} #form-cadastro #depositar-cheque`)
        this.$el.off('click', `${this._block.form} #form-cadastro #devolver-cheque`)
        this.$el.off('click', `${this._block.form} #form-cadastro #cancelar-cheque`)
    }







    overrideEvents() {
        this.reset()

        this.delegateEvents({
            [`click ${this._block.form} #form-cadastro #save`]: 'save',
            [`change ${this._block.form} #form-cadastro .tipo-emissor-form`]: 'changeTipoPessoaAutoComplete',
            [`click ${this._block.form} #form-cadastro #repassar-cheque`]: 'actionButtonsForm',
            [`click ${this._block.form} #form-cadastro #depositar-cheque`]: 'actionButtonsForm',
            [`click ${this._block.form} #form-cadastro #devolver-cheque`]: 'actionButtonsForm',
            [`click ${this._block.form} #form-cadastro #cancelar-cheque`]: 'actionButtonsForm'

        })


        this.callChangeStatusCheque()

    }


    actionButtonsForm(e) {
        e.preventDefault()

        let id = $(e.currentTarget).attr('id')

        let data = utils.JsonUtil.toParse($(e.currentTarget).closest(this._block.form).find('form #row-item').attr('data-item'))

        if (!_.get(data, 'id'))
            return utils.MessageUtil.alert('Ainda não há nenhum cheque lançado!', 'warning')

        switch (id) {
            case 'devolver-cheque':
                new this._formDevolucao(data)
                break
            case 'repassar-cheque':
                new this._formRepasse(data)
                break
            case 'cancelar-cheque':
                utils.EventUtil.emit('event.financeiro.chequeCancelamento.cancelarByCheque', data)
                break
            case 'depositar-cheque':
                new this._formDepositar(data)
                break
        }

    }


    callChangeStatusCheque() {
        utils.EventUtil.on('event.financeiro.cheque.changeStatus', async (status) => {

            try {

                let cheque = utils.JsonUtil.toParse($(this._block.form).find('form #row-item').attr('data-item'))

                _.set(cheque, 'status', status)

                $(this._block.form).find('form #row-item').attr('data-item', utils.JsonUtil.toString(cheque))

            } catch (err) {

                utils.MessageUtil.alert('Não foi possível alterar o status do Cheque! Pesquise novamente o cheque.', 'warning')
            }
        })
    }


    renderFormToContaBancaria(conta = {}, isQuestion = true) {
        try {


            let dataObject = this._model.model(`${this._block.form} #form-cadastro`)

            let form = dataObject.formElement


            form.banco.val(_.get(conta, 'pessoaAgencia.agencia.banco.codigo'))
            form.agencia.val(_.get(conta, 'pessoaAgencia.agencia.numero'))
            form.conta.val(`${_.get(conta, 'numero')}-${_.get(conta, 'dv')}`)


            this.renderDataContaBancariaAgencia(conta)


            if (_.get(this._cheque, 'emissor.id'))
                return true

            if (_.get(conta, 'pessoa.id') && isQuestion == true) {

                let question = {
                    buttons: {
                        'Sim': (e) => {
                            this.renderDataContaEmissor(conta)
                            utils.MessageUtil.closeButton(e)
                        },
                        'Fechar': (e) => {
                            utils.MessageUtil.closeButton(e)
                        }
                    }
                }

                let msg = `Deseja lançar como emissor do cheque ${_.get(conta, 'pessoa.nome')}?`

                utils.MessageUtil.message(msg, 'warning', question)
            }



            return true

        } catch (err) {
            return utils.MessageUtil.alert('Erro ao carregar conta bancária!', 'danger')
        }
    }



    renderAutoCompleteContaBancaria(data = {}) {

        utils.AutoCompleteUtil.AutoComplete({
            type: 'conta-bancaria',
            bloco: `${this._block.form} #bloco-autocomplete-conta-bancaria`,
            input: 'input[name="contaBancariaId"]',
            isClearValue: false,
            form: `${this._block.form} #form-cadastro`,
            callback: (item) => {
                this.renderFormToContaBancaria(item.data)
            }
        })


        if (_.get(data, 'contaBancaria'))
            this.renderFormToContaBancaria(data.contaBancaria, false)

        if (_.get(data, 'contaBancaria.titular')) {
            $(`${this._block.form} #form-cadastro #bloco-autocomplete-conta-bancaria`).val(
                [`${_.get(data, 'contaBancaria.pessoaAgencia.agencia.numero')}`,
                `${_.get(data, 'contaBancaria.pessoaAgencia.agencia.banco.codigo')}`, `${_.get(data, 'contaBancaria.titular')}`
                ].join(' - '))


            if (data.status != 'pendente')
                $(`${this._block.form} #form-cadastro #bloco-autocomplete-conta-bancaria`).attr('disabled', 'disabled')

        }
    }

    async renderDataContaEmissor(data) {
        let dataObject = this._model.model(`${this._block.form} #form-cadastro`)

        let form = dataObject.formElement

        form.emissorId.val(_.get(data, 'pessoa.id'))
        form.tipoEmissor.val(_.get(data, 'pessoa.tipoPessoa'))

        data.tipoCadastro = _.get(data, 'pessoa.tipoPessoa')

        await utils.UnderscoreUtil._template('#template-financeiro-cheque-dados-conta-emissor', { form: data }, '#inner-dados-conta-emissor')
    }

    async renderDataContaBancariaAgencia(conta) {
        await utils.UnderscoreUtil._template('#template-financeiro-cheque-dados-conta-bancaria-agencia', { form: conta }, '#inner-dados-conta-bancaria-agencia')

        await utils.UnderscoreUtil._template('#template-financeiro-cheque-dados-conta-pessoa', { form: conta }, '#inner-dados-conta-pessoa')

    }



    changeTipoPessoaAutoComplete(e) {
        let type = $(e.currentTarget).val()
        this.renderAutoCompletePessoa(type)
    }

    selectTipoPessoaByPessoa(tipoPessoa) {
        if (!tipoPessoa)
            return false

        let block = $(`${this._block.form} #form-cadastro`)

        block.find('.tipo-emissor-form:radio').filter((i, item) => {
            if (this._cheque && _.get(this._cheque, 'status') !== 'pendente') {
                $(item).attr('checked', false)
                $(item).attr({ 'disabled': true })
            }
            if ($(item).val() == tipoPessoa) {
                $(item).attr({ checked: true })
                block.find('#tipo-emissor').val(tipoPessoa)
            }
        })
    }

    renderAutoCompletePessoa(type, data = {}) {


        $(`${this._block.form} #inner-pessoa-autocomplete`).html('')


        if (!type)
            return false

        let name = _.get(data, 'emissor.nome')


        utils.UnderscoreUtil._template('#template-geral-autocomplete-pessoa', { data: { title: type, name: name } }, `${this._block.form} #inner-pessoa-autocomplete`)

        utils.AutoCompleteUtil.AutoComplete({
            type: type,
            bloco: `${this._block.form} #bloco-autocomplete-pessoa`,
            input: 'input[name="emissorId"]',
            isClearValue: false,
            parent: '#form-cadastro',
            callback: async (item) => {

                let pessoa = item.data

                if (pessoa)
                    this.renderDataContaEmissor({ pessoa: pessoa })
            }

        })

        if (_.get(data, 'emissor.id')) {

            if (data.status !== 'pendente')
                $(`${this._block.form} #bloco-autocomplete-pessoa`).attr('disabled', 'disabled')

            this.renderDataContaEmissor({ pessoa: data.emissor })
        }
    }

    origemLancamentoCombobox(data = {}) {

        let options = '<option value="">Selecione...</option>'

        utils.ApiUtil.listOrigemLancamentoCheque().then(itens => {
            itens.map(item => {
                options += `<option value="${item.value}"  ${data.origemLancamento == item.value ? 'selected' : ''}>${item.text}</option>`
            })


            $(`${this._block.form} #form-cadastro #origem-lancamento`).html(options)
        })

    }


    isTerceiroCombobox(data = {}) {

        let options = '<option value="">Selecione...</option>'

        utils.ApiUtil.listBooleanSimNao().forEach(item => {
            options += `<option value="${item.value}"  ${data.isTerceiro == item.value ? 'selected' : ''}>${item.text}</option>`
        })

        $(`${this._block.form} #form-cadastro #is-terceiro`).html(options)

    }




    save(e) {
        e.preventDefault()

        this._model.save($(`${this._block.form} #form-cadastro`)).then((r) => {


            utils.MessageUtil.message(r.message, 'info', {
                buttons: {
                    'Fechar': (event) => {
                        utils.MessageUtil.closeButton(event)
                        this.renderCadastro(r.data)
                    }
                }
            })
        }).catch((err) => {
            utils.MessageUtil.error(err)
        })


    }


    renderPartsCadastro(cheque = {}) {

        this.renderAutoCompleteContaBancaria(cheque)

        this.selectTipoPessoaByPessoa(_.get(cheque, 'tipoEmissor'))
        this.renderAutoCompletePessoa(_.get(cheque, 'tipoEmissor'), cheque)

        this.isTerceiroCombobox(cheque)

        this.origemLancamentoCombobox(cheque)


        utils.EventUtil.emit('event.financeiro.chequeHistorico.listarHistoricosByCheque', { historicos: _.get(cheque, 'historicos'), element: `${this._block.form} #inner-historicos-cheque` })
    }


    async renderCadastro(data = {}) {

        try {

            this.breadCrumbs()

            utils.HtmlUtil.loader()

            if (data.id === undefined)
                this._bread.add('Novo Cadastro').show()
            else
                this._bread.add(`Edição de Cadastro ${data.id}`).show()


            await utils.UnderscoreUtil._template('#template-financeiro-cadastro-cheque', {}, '#inner-content')

            await utils.UnderscoreUtil._template('#template-children-financeiro-cheque', {}, '#inner-content-children')

            await utils.UnderscoreUtil._template('#template-children-cadastro-financeiro-cheque', { form: data }, '#inner-content-children')


            this.renderPartsCadastro(data)


            if (_.get(this._cheque, 'id') && _.get(this._cheque, 'status') !== 'pendente'){
                $(this._block.form).find('#form-cadastro button#save').attr({ 'disabled': true }).addClass('disabled')

                
                
                new this._movimentacaoChequeView.FinanceiroChequeMovimentacaoFormView(this._cheque)

            }


        } catch (err) {
            utils.MessageUtil.error(err)
        }
    }


    async [viewUrl](data, options) {

        return new Promise(async(resolve, reject) => {

            if (options.viewUrl == true && data.id) {
                data = await this._model.listOne(data.id)

                if (!data){
                    utils.UrlUtil.loadUrlBackbone('#home')
                    return reject('Cheque inválido para pesquisa!')
                }

            }

            resolve(data)

        })
    }




    async render(data = {}, options = {}) {
        try {



            let [err, retorno] = await utils.PromiseUtil.to(this[viewUrl](data, options))

            if (err)
                return utils.MessageUtil.alert(err, 'danger')

            data = retorno


            this._cheque = data

            utils.HtmlUtil.loader()

            this._bread.show()

            this.renderCadastro(data)



            


            
        } catch (err) {
            utils.MessageUtil.message(err, 'danger')
        }

        return this
    }

}