let utils = require('../../../helpers/utils-admin')
let enderecoView = require('./includes/endereco-view')


let paginator = utils.PaginatorUtil.paginator()



class ClienteModel extends utils.BackboneModelUtil {

    constructor() {
        super()


    }

    defaults() {

    }


    model(form) {
        return utils.FormUtil.mapObject(form)
    }

    async listTiposEstabelecimento() {

        return await utils.ApiUtil.tiposEstabelecimentoEnum()
    }

    async save(data) {
        this.url = utils.UrlUtil.url(`admin/clientes/save`)

        //let item = utils.JsonUtil.toParse($(data).find('#row-item').attr('data-item'))

        //let send = { data: this.model(data).formObject, type: 'POST', table : 'clientes', operacao : 'save', message: 'Cliente salvo com sucesso!', backup: item }


        let send = { data: this.model(data).formObject, type: 'POST' }

        return await this.fetch(send)
    }

    async listAll(data = {}) {


        _.assign(data, paginator)

        this.url = utils.UrlUtil.url(`admin/clientes/list`)

        let send = { type: 'POST', data: data }

        let retorno = await this.fetch(send)

        if (retorno && (retorno.length > 0))
            paginator = utils.PaginatorUtil.calcularPaginator(paginator)



        return retorno
    }
}




class ClienteListView extends Backbone.View {
    constructor() {
        super()

        this._model = new ClienteModel()

        paginator = utils.PaginatorUtil.paginator()

        this.$el = $('body')

        this.overrideEvents()

        this.render()
    }


    reset() {
        this.$el.off('click', '#block-list-cliente #btn-novo-cadastro')
        this.$el.off('click', '#block-list-cliente .btn-editar-cadastro')
        this.$el.off('click', '#block-list-cliente .carregar-mais')
        this.$el.off('click', '#block-list-cliente .pesquisar')
        this.$el.off('click', '#block-list-cliente .limpar-pesquisa')
    }

    overrideEvents() {
        this.reset()


        this.delegateEvents({
            "click #block-list-cliente #btn-novo-cadastro": "renderCadastro",
            "click #block-list-cliente .btn-editar-cadastro": "edit",
            'click #block-list-cliente .carregar-mais': 'carregarMaisItensCadastro',
            'click #block-list-cliente .pesquisar': 'pesquisarClientes',
            'click #block-list-cliente .limpar-pesquisa': 'limparPesquisaCliente',
        })
    }

    edit(e) {
        e.preventDefault()

        let data = utils.JsonUtil.toParse($(e.currentTarget).closest('.row-item-list').attr('data-item'))

        window.location.hash = "#cadastro-de-clientes/edicao-cadastro-cliente"

        new ClienteView(data)
    }

    carregarMaisItensCadastro(e) {
        e.preventDefault()

        $('#block-list-cliente .carregar-mais').attr({ 'disabled': true })

        this.carregarClientes({ append: true })
    }


    getFormPesquisaCache() {
        let form = {}

        if (utils.localStorageUtil.isStorageItem('ultima_pesquisa_clientes_cadastro'))
            form = utils.localStorageUtil.getStorage('ultima_pesquisa_clientes_cadastro')

        return form
    }

    limparPesquisaCliente(e) {
        e.preventDefault()


        utils.localStorageUtil.removeStorage('ultima_pesquisa_clientes_cadastro')

        this.renderFormPesquisa({ isClear: true })
    }

    pesquisarClientes(e) {
        e.preventDefault()

        paginator = utils.PaginatorUtil.paginator()

        let form = utils.FormUtil.mapObject('#block-list-cliente #form-pesquisa')


        utils.localStorageUtil.setStorage('ultima_pesquisa_clientes_cadastro', form.formObject.pesquisa)



        this.carregarClientes()

    }


    renderAutoCompleteClienteFormPesquisa() {
        utils.UnderscoreUtil._template('#template-form-pesquisa-clientes-autocomplete-cliente', {}, '#inner-cliente-autocomplete-pesquisa')

        utils.AutoCompleteUtil.AutoComplete({
            type: 'cliente',
            bloco: '#block-list-cliente #bloco-autocomplete-cliente',
            input: 'input[name="pesquisa_id"]',
            isClearValue: false,
            form: '#block-list-cliente #form-pesquisa'

        })
    }




    renderFormPesquisa(options = {}) {

        let form = this.getFormPesquisaCache()


        utils.UnderscoreUtil._template("#template-form-pesquisa-clientes", { form: form }, '#inner-form-pesquisa-cliente')

        this.renderAutoCompleteClienteFormPesquisa()

        let select = $('#block-list-cliente #form-pesquisa').find('#pesquisa-status')
        select.append('<option value="">Todos</option>')
        utils.ApiUtil.listBooleanSimNao().forEach(item => {
            select.append(`<option value="${item.value}" ${item.value == utils.StringUtil.stringToBoolean(form.status) && ['true', 'false'].indexOf(form.status) !== -1 ? 'selected' : ''} >${item.text}</option>`)
        })


        $.when(utils.EstadoMunicipioUtil.municipioSelectBox(
            {
                municipioElement: '#block-list-cliente #pesquisa-endereco-municipio-id',
                municipio: utils.ObjectUtil.getValueProperty(form, 'endereco.municipio.id')
            }
        ))
    }


    carregarClientes(options = {}) {

        let form = this.getFormPesquisaCache()

        let overlay = $(`#block-list-cliente #overlay-painel-list-cadastro`).find('.overlay')

        overlay.show()

        this._model.listAll(form).then((r) => {

            this.renderClientes(r, options)

            overlay.hide()


        }).catch((err) => {
            utils.MessageUtil.error(err)
        })
    }

    renderClientes(data = {}, options = {}) {



        _.assign(options, { isDesktopMobile: true, closeLoader: true })

        utils.UnderscoreUtil._template('#template-list-table-clientes-cadastrados', { clientes: data }, '#inner-clientes-cadastrados', options)

        if (data.length > 0)
            $('#block-list-cliente .carregar-mais').attr({ 'disabled': false })



    }

    renderTela() {

        try {


            utils.UnderscoreUtil._template('#template-cadastro-cliente', {}, '#inner-content', { isLoader: true })

            utils.UnderscoreUtil._template('#template-children-cliente', {}, '#inner-content-children')

            utils.UnderscoreUtil._template('#template-children-cadastro-list-clientes', {}, '#inner-content-children-cliente')

            this.renderFormPesquisa()

        } catch (err) {
            utils.MessageUtil.error(err)
        }
    }


    render() {
        try {

            utils.HtmlUtil.loader()

            this.renderTela()

            this.carregarClientes()



        } catch (err) {
            utils.MessageUtil.message(err, 'danger')
        }
        return this
    }


}


class ClienteView extends Backbone.View {

    constructor(cliente = {}) {
        super()

        this._bread = new utils.BreadCrumb()

        this.breadCrumbs()

        this._pathUrl = Backbone.history.getFragment()


        this._model = new ClienteModel()

        this.$el = $('body')

        this.overrideEvents()

        this.render(cliente)
    }

    breadCrumbs() {
        this._bread.add('inicio', '#home')
            .add('Clientes', '#cadastro-de-clientes')
    }

    reset() {
        this.$el.off('click', '#block-form-cliente #form-cadastro #save')
        this.$el.off('change', '#block-form-cliente #form-cadastro #tipo-pessoa')
        this.$el.off('change', '#block-form-cliente #form-cadastro #tipo-estabelecimento')
        this.$el.off('click', '#block-form-cliente #btn-novo-cadastro')

    }


    overrideEvents() {
        this.reset()


        this.delegateEvents({
            "click #block-form-cliente #form-cadastro #save": "save",
            "change #block-form-cliente #form-cadastro #tipo-pessoa": 'tipoPessoa',
            "change #block-form-cliente #form-cadastro #tipo-estabelecimento": 'tipoEstabelecimento',
            "click #block-form-cliente #btn-novo-cadastro": (e) => {
                e.preventDefault()
                new ClienteView()
            }
        })

    }

    tipoEstabelecimento(e, data) {
        e.preventDefault()

        if (data) {



            this._model.listTiposEstabelecimento().then((r) => {

                let option = ''
                r.forEach((item) => {
                    option += `<option ${item.value == utils.ObjectUtil.getValueProperty(data, 'tipoEstabelecimento') ? 'selected' : ''} value=${item.value}>${item.text}</option>`
                })

                $('#block-form-cliente #form-cadastro').find('#tipo-estabelecimento').html(option)

            }).catch((err) => {

            })

        }

    }

    tipoPessoa(e, data) {
        e.preventDefault()

        if (data) {
            if (utils.ObjectUtil.getValueProperty(data, 'cliente.tipoPessoa') == 'F')
                $('#block-form-cliente #form-cadastro').find('#tipoPessoaFisica').attr('selected', true)
            else
                $('#block-form-cliente #form-cadastro').find('#tipoPessoaJuridica').attr('selected', true)
        }


        let value = $('#block-form-cliente #form-cadastro').find('#tipo-pessoa option').filter(':selected').val()

        if (value == 'F') {
            $('#block-form-cliente #form-cadastro').find('#cnpj').val('').attr('name', 'cnpj')
            $('#block-form-cliente #form-cadastro').find('#cpf').attr('name', 'cliente_cnpjCpf')
            $('#block-form-cliente #form-cadastro').find('#bloco-pessoa-juridica').hide()
            $('#block-form-cliente #form-cadastro').find('#bloco-pessoa-fisica').show()

        } else {
            $('#block-form-cliente #form-cadastro').find('#cpf').val('').attr('name', 'cpf')
            $('#block-form-cliente #form-cadastro').find('#cnpj').attr('name', 'cliente_cnpjCpf')
            $('#block-form-cliente #form-cadastro').find('#bloco-pessoa-fisica').hide()
            $('#block-form-cliente #form-cadastro').find('#bloco-pessoa-juridica').show()
        }


    }



    save(e) {
        e.preventDefault()

        this._model.save($('#block-form-cliente #form-cadastro')).then((r) => {


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

        let overlay = $(`#block-form-cliente #status`).closest('.form-group').find('.overlay')

        overlay.show()

        let options = ''
        
        utils.ApiUtil.listBooleanSimNao().forEach(item => {
            options += `<option value="${item.value}"  ${ _.get(data, 'cliente.status') == item.value ? 'selected' : ''}>${item.text}</option>`
        })

        overlay.hide()

        $('#block-form-cliente #form-cadastro').find('#status').html(options)

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




            utils.UnderscoreUtil._template('#template-cadastro-cliente', {}, '#inner-content')
            await utils.UnderscoreUtil._template('#template-children-cadastro-clientes', { form: data }, '#inner-content-children')


            $('#block-form-cliente #form-cadastro').find('#tipoPessoaFisica').trigger('change', { tipoPessoa: utils.ObjectUtil.getValueProperty(data, 'cliente.tipoPessoa') })
            $('#block-form-cliente #form-cadastro').find('#tipo-estabelecimento').trigger('change', { tipoEstabelecimento: utils.ObjectUtil.getValueProperty(data, 'cliente.tipoEstabelecimento') })



            $.when(utils.EstadoMunicipioUtil.estadoMunicipioSelectBox({
                municipio: municipioSelecionado
            }))

            this.statusComboBox(data)

            let blockTelefone = new utils.TelefoneUtil('#block-form-cliente #form-cadastro', '#inner-telefone-cliente')

            if (data.telefones && (data.telefones.length > 0))
                await blockTelefone.addListaTelefones(data.telefones)
            else
                await blockTelefone.add()


            new utils.LocationUtil('#block-form-cliente #form-cadastro')

            new enderecoView.EnderecoListVew('#block-form-cliente #form-cadastro', data.enderecos, { tipoPessoa: 'cliente', pessoaId: data.id })





            utils.JqueryUtil.initializeComponentesJquery()
            utils.MaskInputUtil.mask()


        } catch (err) {
            utils.MessageUtil.error(err)
        }
    }

    render(cliente = {}) {
        try {

            utils.HtmlUtil.loader()

            this._bread.show()

            this.renderCadastro(cliente)

        } catch (err) {
            utils.MessageUtil.message(err, 'danger')
        }
        return this
    }

}

module.exports = {
    ClienteListVew: () => { return new ClienteListView() },
    ClienteView: () => { return new ClienteView() }
} 