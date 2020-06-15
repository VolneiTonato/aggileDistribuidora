const utils = require('../../../../../../helpers/utils-admin')

class CedenteView extends Backbone.View {

    constructor(data = {}) {
        super()

        this._bread = new utils.BreadCrumb()

        this.breadCrumbs()

        this._pathUrl = Backbone.history.getFragment()

        this.$el = $('body')

        this.overrideEvents()

        process.nextTick(() => {
            this._model = new (require('../../../models/cedente'))()
            this._enderecoView = require('../../endereco-view')
            this.render(data)
        })
    }

    breadCrumbs() {
        this._bread.add('inicio', '#home')
            .add('Cedentes', '#cadastro-de-cedentes')
    }

    reset() {
        this.$el.off('click', '#block-form-cedente #form-cadastro #save')
        this.$el.off('change', '#block-form-cedente #form-cadastro #tipo-pessoa')
        this.$el.off('click', '#block-form-cedente #btn-novo-cadastro')
    }


    overrideEvents() {
        this.reset()


        this.delegateEvents({
            "click #block-form-cedente #form-cadastro #save": "save",
            "change #block-form-cedente #form-cadastro #tipo-pessoa": 'tipoPessoa',
            "click #block-form-cedente #btn-novo-cadastro": "novoCadastro"
        })

    }


    novoCadastro(e) {
        e.preventDefault()
        
        new CedenteView()
        
        
    }

    tipoPessoa(e, data) {
        e.preventDefault()

        if (data) 
            if (utils.ObjectUtil.getValueProperty(data, 'cliente.cedente') == 'F')
                $('#block-form-cedente #form-cadastro').find('#tipoPessoaFisica').attr('selected', true)
            else
                $('#block-form-cedente #form-cadastro').find('#tipoPessoaJuridica').attr('selected', true)
        


        let value = $('#block-form-cedente #form-cadastro').find('#tipo-pessoa option').filter(':selected').val()

        if (value == 'F') {
            $('#block-form-cedente #form-cadastro').find('#cnpj').val('').attr('name', 'cnpj')
            $('#block-form-cedente #form-cadastro').find('#cpf').attr('name', 'cedente_cnpjCpf')
            $('#block-form-cedente #form-cadastro').find('#bloco-pessoa-juridica').hide()
            $('#block-form-cedente #form-cadastro').find('#bloco-pessoa-fisica').show()

        } else {
            $('#block-form-cedente #form-cadastro').find('#cpf').val('').attr('name', 'cpf')
            $('#block-form-cedente #form-cadastro').find('#cnpj').attr('name', 'cedente_cnpjCpf')
            $('#block-form-cedente #form-cadastro').find('#bloco-pessoa-fisica').hide()
            $('#block-form-cedente #form-cadastro').find('#bloco-pessoa-juridica').show()
        }


    }



    save(e) {
        e.preventDefault()

        this._model.save($('#block-form-cedente #form-cadastro')).then((r) => {


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

        let overlay = $(`#block-form-cedente #status`).closest('.form-group').find('.overlay')

        overlay.show()

        let options = ''

        utils.ApiUtil.listBooleanSimNao().forEach(item => {
            options += `<option value="${item.value}"  ${data.status == item.value ? 'selected' : ''}>${item.text}</option>`
        })

        overlay.hide()

        $('#block-form-cedente #form-cadastro').find('#status').html(options)

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




            utils.UnderscoreUtil._template('#template-cadastro-cedente', {}, '#inner-content')
            await utils.UnderscoreUtil._template('#template-children-cadastro-cedentes', { form: data }, '#inner-content-children')


            $('#block-form-cedente #form-cadastro').find('#tipoPessoaFisica').trigger('change', { tipoPessoa: data.tipoPessoa })



            $.when(utils.EstadoMunicipioUtil.estadoMunicipioSelectBox({
                municipio: municipioSelecionado
            }))

            this.statusComboBox(data)

            let blockTelefone = new utils.TelefoneUtil('#block-form-cedente #form-cadastro', '#inner-telefone-cedente')

            if (data.telefones && (data.telefones.length > 0))
                await blockTelefone.addListaTelefones(data.telefones)
            else
                await blockTelefone.add()


            new utils.LocationUtil('#block-form-cedente #form-cadastro')

            new this._enderecoView.EnderecoListVew('#block-form-cedente #form-cadastro', data.enderecos, { tipoPessoa: 'cedente', pessoaId: data.id })





            utils.JqueryUtil.initializeComponentesJquery()
            utils.MaskInputUtil.mask()


        } catch (err) {
            utils.MessageUtil.error(err)
        }
    }

    render(data = {}) {
        try {

            utils.HtmlUtil.loader()

            this._bread.show()

            this.renderCadastro(data)

        } catch (err) {
            utils.MessageUtil.message(err, 'danger')
        }
        return this
    }

}

module.exports = CedenteView