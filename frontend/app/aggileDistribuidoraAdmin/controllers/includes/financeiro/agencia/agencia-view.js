let utils = require('../../../../../../helpers/utils-admin')

class FinanceiroAgenciaView extends Backbone.View {

    constructor(agencia = {}) {
        super()

        this._bread = new utils.BreadCrumb()

        this.breadCrumbs()

        this._pathUrl = Backbone.history.getFragment()

        this.$el = $('body')

        this.overrideEvents()

        process.nextTick(() => {
            this._model = new (require('../../../models/agencia'))(),
                this._enderecoView = require('../../endereco-view')
            this.render(agencia)
        })


    }

    breadCrumbs() {
        this._bread.add('inicio', '#home')
            .add('Agencias', '#financeiro/cadastro-de-agencias/pesquisa')
    }

    reset() {
        this.$el.off('click', '#block-form-financeiro-agencia #form-cadastro #save')
        this.$el.off('change', '#block-form-financeiro-agencia #form-cadastro #tipo-pessoa')
        this.$el.off('click', '#block-form-financeiro-agencia #form-cadastro .btn-editar-cadastro')
    }




    overrideEvents() {
        this.reset()


        this.delegateEvents({
            "click #block-form-financeiro-agencia #form-cadastro #save": "save",
            "change #block-form-financeiro-agencia #form-cadastro #tipo-pessoa": 'tipoPessoa'
        })

    }


    async renderAutoCompleteBancoFormCadastro(data = {}) {


        utils.AutoCompleteUtil.AutoCompleteIndexDb({

            bloco: '#block-form-financeiro-agencia #form-cadastro #banco-autocomplete-cadastro-agencia',
            input: 'input[name="agencia_bancoId"]',
            isClearValue: false,
            form: '#block-form-financeiro-agencia #form-cadastro',
            optionsIndexDb: {
                rows: ['codigo', 'descricao'],
                database: 'bancos',
                labels: 'descricao',
                template: '#template-autocomplete-bancos',
                primaryKey: 'id',
            }
        })

        

        if(utils.ObjectUtil.getValueProperty(data, 'agencia.banco'))
            $('#block-form-financeiro-agencia #form-cadastro #banco-autocomplete-cadastro-agencia').val(utils.ObjectUtil.getValueProperty(data, 'agencia.banco.descricao'))
    }

    tipoPessoa(e, data) {
        e.preventDefault()

        if (data) {
            if(utils.ObjectUtil.getValueProperty(data, 'agencia.tipoPessoa') == 'F')
                $('#block-form-financeiro-agencia #form-cadastro').find('#tipoPessoaFisica').attr('selected', true)
            else
                $('#block-form-financeiro-agencia #form-cadastro').find('#tipoPessoaJuridica').attr('selected', true)
        }


        let value = $('#block-form-financeiro-agencia #form-cadastro').find('#tipo-pessoa option').filter(':selected').val()

        if (value == 'F') {
            $('#block-form-financeiro-agencia #form-cadastro').find('#cnpj').val('').attr('name', 'cnpj')
            $('#block-form-financeiro-agencia #form-cadastro').find('#cpf').attr('name', 'agencia_cnpjCpf')
            $('#block-form-financeiro-agencia #form-cadastro').find('#bloco-pessoa-juridica').hide()
            $('#block-form-financeiro-agencia #form-cadastro').find('#bloco-pessoa-fisica').show()

        } else {
            $('#block-form-financeiro-agencia #form-cadastro').find('#cpf').val('').attr('name', 'cpf')
            $('#block-form-financeiro-agencia #form-cadastro').find('#cnpj').attr('name', 'agencia_cnpjCpf')
            $('#block-form-financeiro-agencia #form-cadastro').find('#bloco-pessoa-fisica').hide()
            $('#block-form-financeiro-agencia #form-cadastro').find('#bloco-pessoa-juridica').show()
        }


    }



    save(e) {
        e.preventDefault()

        this._model.save($('#block-form-financeiro-agencia #form-cadastro')).then((r) => {


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

        let overlay = $(`#block-form-financeiro-agencia #status`).closest('.form-group').find('.overlay')

        overlay.show()

        let options = ''

        utils.ApiUtil.listBooleanSimNao().forEach(item => {
            options += `<option value="${item.value}"  ${data.status == item.value ? 'selected' : ''}>${item.text}</option>`
        })

        overlay.hide()

        $('#block-form-financeiro-agencia #form-cadastro').find('#status').html(options)

    }


    async renderCadastro(data = {}) {

        try {

            this.breadCrumbs()

            utils.HtmlUtil.loader()

            if (data.id === undefined)
                this._bread.add('Novo Cadastro').show()
            else
                this._bread.add(`Edição de Cadastro ${data.id}`).show()

            let municipioSelecionado = ''

            try {
                municipioSelecionado = data.endereco.municipio.id
            } catch (err) {

            }




            await utils.UnderscoreUtil._template('#template-financeiro-cadastro-agencia', {}, '#inner-content')

            await utils.UnderscoreUtil._template('#template-children-financeiro-agencia', {}, '#inner-content-children')

            await utils.UnderscoreUtil._template('#template-children-cadastro-financeiro-agencia', { form: data }, '#inner-content-children')


            $('#block-form-financeiro-agencia #form-cadastro').find('#tipoPessoaFisica').trigger('change', { tipoPessoa: data.tipoPessoa })


            this.renderAutoCompleteBancoFormCadastro(data)


            $.when(utils.EstadoMunicipioUtil.estadoMunicipioSelectBox({
                municipio: municipioSelecionado
            }))

            this.statusComboBox(data)

            let blockTelefone = new utils.TelefoneUtil('#block-form-financeiro-agencia #form-cadastro', '#inner-telefone-financeiro-agencia')

            if (data.telefones && (data.telefones.length > 0))
                await blockTelefone.addListaTelefones(data.telefones)
            else
                await blockTelefone.add()


            new utils.LocationUtil('#block-form-financeiro-agencia #form-cadastro')

            new this._enderecoView.EnderecoListVew('#block-form-financeiro-agencia #form-cadastro', data.enderecos, { tipoPessoa: 'agencia', pessoaId: data.id })





            utils.JqueryUtil.initializeComponentesJquery()
            utils.MaskInputUtil.mask()


        } catch (err) {
            utils.MessageUtil.error(err)
        }
    }

    render(agencia = {}) {
        try {

            utils.HtmlUtil.loader()

            this._bread.show()

            this.renderCadastro(agencia)

        } catch (err) {
            utils.MessageUtil.message(err, 'danger')
        }
        return this
    }

}


module.exports = FinanceiroAgenciaView