let utils = require('../../../../../../helpers/utils-admin')

class FinanceiroContaBancariaView extends Backbone.View {

    constructor(contaBancaria = {}) {
        super()

        this._bread = new utils.BreadCrumb()

        this.breadCrumbs()

        this._pathUrl = Backbone.history.getFragment()

        this._blocoTelefone = undefined

        this.$el = $('body')

        this.overrideEvents()

        process.nextTick(() => {
            this._model = new (require('../../../models/conta-bancaria'))(),
                this.render(contaBancaria)
        })


    }

    breadCrumbs() {
        this._bread.add('inicio', '#home')
            .add('Contas Bancárias', '#financeiro/cadastro-de-contas-bancarias/pesquisa')
    }

    reset() {
        this.$el.off('click', '#block-form-financeiro-conta-bancaria #form-cadastro #save')
        this.$el.off('change', '#block-form-financeiro-conta-bancaria #form-cadastro #tipo-pessoa')
        this.$el.off('click', '#block-form-financeiro-conta-bancaria #form-cadastro .btn-editar-cadastro')
        this.$el.off('change', '#block-form-financeiro-conta-bancaria #form-cadastro .tipo-cadastro')
    }




    overrideEvents() {
        this.reset()


        this.delegateEvents({
            "click #block-form-financeiro-conta-bancaria #form-cadastro #save": "save",
            "change #block-form-financeiro-conta-bancaria #form-cadastro #tipo-pessoa": 'tipoPessoa',
            'change #block-form-financeiro-conta-bancaria #form-cadastro .tipo-cadastro': 'alterarTipoCadastro'
        })

    }

    async renderBlocoTelefone(data = {}, options = { append: false }) {

        if (!options.append == true)
            this._blocoTelefone = new utils.TelefoneUtil('#block-form-financeiro-conta-bancaria #form-cadastro', '#inner-telefone-financeiro-conta-bancaria')



        if (data.telefones && (data.telefones.length > 0))
            await this._blocoTelefone.addListaTelefones(data.telefones)
        else
            await this._blocoTelefone.add()
    }



    renderAutoComplete(data = {}, options = { type }) {

        let { type } = options

        let self = this

        utils.AutoCompleteUtil.AutoComplete({
            type: `${type}`,
            bloco: `#block-form-financeiro-conta-bancaria #bloco-autocomplete-${type}`,
            input: 'input[name="pessoaId"]',
            isClearValue: false,
            form: '#block-form-financeiro-conta-bancaria #form-cadastro',
            callback: (item) => {
                self.renderBlocoTelefone(item.data, { append: false })
            }   

        })

        let html = $(`#block-form-financeiro-conta-bancaria #form-cadastro #bloco-tipo-cadastro-${type} #bloco-autocomplete-${type}`)



        if (data.tipoCadastro == type && data['pessoa'][type]) {


            if ((['cliente', 'fabrica', 'cedente']).indexOf(type) !== -1)
                $(html).val(data.pessoa[type]['nomeFantasia'])
            else if (type == 'vendedor')
                $(html).val(data.pessoa[type]['nomeCompleto'])

        }

    }


    renderAutoCompleteAgencia(data = {}) {

        utils.AutoCompleteUtil.AutoComplete({
            type: 'agencia',
            bloco: '#block-form-financeiro-conta-bancaria #bloco-autocomplete-agencia',
            input: 'input[name="pessoaAgenciaId"]',
            isClearValue: false,
            form: '#block-form-financeiro-conta-bancaria #form-cadastro'
        })

        if (_.get(data, 'pessoaAgencia.agencia'))
            $('#block-form-financeiro-conta-bancaria #form-cadastro #bloco-autocomplete-agencia').val(_.get(data, 'pessoaAgencia.agencia.nome'))
    }


    callAlterarTipoCadastro(data = {}) {

        let value = data.tipoCadastro


        let form = $('#block-form-financeiro-conta-bancaria #form-cadastro')

        _.each(['cliente', 'vendedor', 'fabrica', 'cedente'], type => {
            form.find(`#bloco-tipo-cadastro-${type}`).hide()
        })






        if (value != 'sem-associacao')
            form.find(`#bloco-tipo-cadastro-${value}`).show()
        else
            form.find('input[name="pessoaId"]').val('')

        form.find(`.tipo-cadastro[value="${value}"]`).attr({ 'checked': true })

        //form.find('#tipo-cadastro').val(value)
    }



    async alterarTipoCadastro(e) {
        e.preventDefault()

        this.callAlterarTipoCadastro({ tipoCadastro: $(e.currentTarget).val() })

    }




    tipoPessoa(e, data) {
        e.preventDefault()

        if (data) {
            if (data.tipoPessoa == 'F')
                $('#block-form-financeiro-conta-bancaria #form-cadastro').find('#tipoPessoaFisica').attr('selected', true)
            else
                $('#block-form-financeiro-conta-bancaria #form-cadastro').find('#tipoPessoaJuridica').attr('selected', true)
        }


        let value = $('#block-form-financeiro-conta-bancaria #form-cadastro').find('#tipo-pessoa option').filter(':selected').val()

        if (value == 'F') {
            $('#block-form-financeiro-conta-bancaria #form-cadastro').find('#cnpj').val('').attr('name', 'cnpj')
            $('#block-form-financeiro-conta-bancaria #form-cadastro').find('#cpf').attr('name', 'cnpjCpf')
            $('#block-form-financeiro-conta-bancaria #form-cadastro').find('#bloco-pessoa-juridica').hide()
            $('#block-form-financeiro-conta-bancaria #form-cadastro').find('#bloco-pessoa-fisica').show()

        } else {
            $('#block-form-financeiro-conta-bancaria #form-cadastro').find('#cpf').val('').attr('name', 'cpf')
            $('#block-form-financeiro-conta-bancaria #form-cadastro').find('#cnpj').attr('name', 'cnpjCpf')
            $('#block-form-financeiro-conta-bancaria #form-cadastro').find('#bloco-pessoa-fisica').hide()
            $('#block-form-financeiro-conta-bancaria #form-cadastro').find('#bloco-pessoa-juridica').show()
        }


    }



    save(e) {
        e.preventDefault()

        this._model.save($('#block-form-financeiro-conta-bancaria #form-cadastro')).then((r) => {


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


    statusComboBox(data = {}) {

        let overlay = $(`#block-form-financeiro-conta-bancaria #status`).closest('.form-group').find('.overlay')

        overlay.show()

        let options = ''

        utils.ApiUtil.listBooleanSimNao().forEach(item => {
            options += `<option value="${item.value}"  ${data.status == item.value ? 'selected' : ''}>${item.text}</option>`
        })

        overlay.hide()

        $('#block-form-financeiro-conta-bancaria #form-cadastro').find('#status').html(options)

    }



    async renderCadastro(data = {}) {

        try {

            this.breadCrumbs()

            utils.HtmlUtil.loader()

            if (data.id === undefined)
                this._bread.add('Novo Cadastro').show()
            else
                this._bread.add(`Edição de Cadastro ${data.id}`).show()


            let tipoCadastro = data.tipoCadastro


            if (data.id && tipoCadastro != 'sem-associacao' && data.telefones.length == 0)
                data.telefones = data.pessoa.telefones




            await utils.UnderscoreUtil._template('#template-financeiro-cadastro-conta-bancaria', {}, '#inner-content')

            await utils.UnderscoreUtil._template('#template-children-financeiro-conta-bancaria', {}, '#inner-content-children')

            await utils.UnderscoreUtil._template('#template-children-cadastro-financeiro-conta-bancaria', { form: data }, '#inner-content-children')




            $('#block-form-financeiro-conta-bancaria #form-cadastro').find('#bloco-tipo-cadastro-cliente, #bloco-tipo-cadastro-fabrica').hide()


            $('#block-form-financeiro-conta-bancaria #form-cadastro').find('#tipoPessoaFisica').trigger('change', { tipoPessoa: data.tipoPessoa })

            this.renderBlocoTelefone(data)


            this.callAlterarTipoCadastro(data)


            this.renderAutoCompleteAgencia(data)
            this.renderAutoComplete(data, { type: 'cliente' })
            this.renderAutoComplete(data, { type: 'fabrica' })
            this.renderAutoComplete(data, { type: 'vendedor' })
            this.renderAutoComplete(data, { type: 'cedente' })

            this.statusComboBox(data)



            //utils.JqueryUtil.initializeComponentesJquery()
            //utils.MaskInputUtil.mask()


        } catch (err) {
            utils.MessageUtil.error(err)
        }
    }

    render(contaBancaria = {}) {
        try {

            utils.HtmlUtil.loader()

            this._bread.show()

            this.renderCadastro(contaBancaria)

        } catch (err) {
            utils.MessageUtil.message(err, 'danger')
        }
        return this
    }

}


module.exports = FinanceiroContaBancariaView