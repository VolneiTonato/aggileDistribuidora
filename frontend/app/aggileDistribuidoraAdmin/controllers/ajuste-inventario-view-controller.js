let utils = require('../../../helpers/utils-admin')


let paginator = utils.PaginatorUtil.paginator()


const renderOperacao = (element, form = {}) => {
    utils.ApiUtil.listOperacaoInventario().then((operacoes) => {

        let select = $(element)

        select.append('<option value="">Selecione...</option>')

        operacoes.forEach((item) => {
            select.append(`<option value="${item.value}" ${item.value == form.operacao ? 'selected' : ''} >${item.text}</option>`)
        })
    })
}

class AjusteInventarioModel extends utils.BackboneModelUtil {

    constructor() {
        super()


    }

    defaults() {

    }


    model(form) {
        return utils.FormUtil.mapObject(form)
    }

    async save(data) {
        this.url = utils.UrlUtil.url(`admin/inventario/save`)

        let send = { data: data, type: 'POST' }

        return await this.fetch(send)
    }

    async listAll(data = {}) {

        _.assign(data, paginator)

        this.url = utils.UrlUtil.url(`admin/inventario/list`)

        let send = { type: 'POST', data: data }

        let retorno = await this.fetch(send)

        if (retorno && (retorno.length > 0)) 
            paginator = utils.PaginatorUtil.calcularPaginator(paginator)
        

        return retorno
    }
}

class AjusteInventarioListView extends Backbone.View {

    constructor() {
        super()

        this._bread = new utils.BreadCrumb()

        this.breadCrumbs()

        this._pathUrl = Backbone.history.getFragment()

        paginator = utils.PaginatorUtil.paginator()


        this._model = new AjusteInventarioModel()

        this.$el = $('body')

        this.overrideEvents()

        this.render()
    }

    breadCrumbs() {
        this._bread.add('inicio', '#home')
            .add('Volumes', '#cadastro-de-volumes')
    }

    reset() {
        this.$el.off('click', '#block-list-inventario .carregar-mais')
        this.$el.off('click', '#block-list-inventario .pesquisar')
        this.$el.off('click', '#block-list-inventario .limpar-pesquisa')
    }


    overrideEvents() {
        this.reset()


        this.delegateEvents({
            'click #block-list-inventario .carregar-mais': 'carregarMaisItensCadastro',
            'click #block-list-inventario .pesquisar': 'pesquisar',
            'click #block-list-inventario .limpar-pesquisa': 'limparPesquisa',
        })

    }


    getFormPesquisaCache() {
        let form = {}

        if (utils.localStorageUtil.isStorageItem('ultima_pesquisa_inventario_cadastro'))
            form = utils.localStorageUtil.getStorage('ultima_pesquisa_inventario_cadastro')

        return form
    }

    limparPesquisa(e) {
        e.preventDefault()


        utils.localStorageUtil.removeStorage('ultima_pesquisa_inventario_cadastro')

        this.renderFormPesquisa({ isClear: true })
    }

    pesquisar(e) {
        e.preventDefault()

        paginator = utils.PaginatorUtil.paginator()

        let form = utils.FormUtil.mapObject('#block-list-inventario #form-pesquisa')


        utils.localStorageUtil.setStorage('ultima_pesquisa_inventario_cadastro', form.formObject.pesquisa)



        this.carregarInventario()

    }





    renderFormPesquisa(options = {}) {

        let form = this.getFormPesquisaCache()

        utils.UnderscoreUtil._template("#template-form-pesquisa-inventario", { form: form }, '#inner-form-pesquisa-inventario')

        renderOperacao('#block-list-inventario #form-pesquisa #pesquisa-operacao', form)
    }

    carregarMaisItensCadastro(e) {
        e.preventDefault()

        $('#block-list-inventario .carregar-mais').attr({ 'disabled': true })

        this.carregarInventario({ append: true })
    }

    carregarInventario(options = {}) {

        let form = this.getFormPesquisaCache()

        let overlay = $(`#block-list-inventario #overlay-painel-list-cadastro`).find('.overlay')

        overlay.show()


        overlay.hide()

        this._model.listAll(form).then((r) => {

            this.renderInventario(r, options)

            overlay.hide()


        }).catch((err) => {
            utils.MessageUtil.error(err)
        })
    }

    renderInventario(data = {}, options = {}) {

        _.assign(options, { isDesktopMobile: true, closeLoader: true })

        utils.UnderscoreUtil._template('#template-list-table-inventario-cadastrados', { inventarios: data }, '#inner-inventario-cadastrados', options)

        if (data.length > 0)
            $('#block-list-inventario .carregar-mais').attr({ 'disabled': false })


    }



    renderTela() {

        try {


            utils.UnderscoreUtil._template('#template-cadastro-inventario', {}, '#inner-content', { isLoader: true })

            utils.UnderscoreUtil._template('#template-children-inventario', {}, '#inner-content-children')

            utils.UnderscoreUtil._template('#template-children-cadastro-list-inventario', {}, '#inner-content-children-inventario')


            this.renderFormPesquisa()

        } catch (err) {
            utils.MessageUtil.error(err)
        }
    }


    render() {
        try {

            utils.HtmlUtil.loader()

            this.renderTela()

            this.carregarInventario()

        } catch (err) {
            utils.MessageUtil.message(err, 'danger')
        }
        return this
    }


}

class AjusteInventarioView extends Backbone.View {

    constructor(inventario = {}) {
        super()

        this._bread = new utils.BreadCrumb()

        this.breadCrumbs()

        this._pathUrl = Backbone.history.getFragment()

        paginator = utils.PaginatorUtil.paginator()


        this._model = new AjusteInventarioModel()

        this.$el = $('body')

        this.overrideEvents()

        this.render(inventario)
    }

    breadCrumbs() {
        this._bread.add('inicio', '#home')
            .add('Volumes', '#cadastro-de-inventario')
    }

    reset() {
        this.$el.off('click', '#block-form-inventario #inner-lancamento-produto #lancar-produto-inventario')
        this.$el.off('click', '#block-form-inventario #inner-lancamento-produto #cancelar-lancamento')
    }


    overrideEvents() {
        this.reset()


        this.delegateEvents({
            "click #block-form-inventario #inner-lancamento-produto #lancar-produto-inventario": "save",
            "click #block-form-inventario #inner-lancamento-produto #cancelar-lancamento": "cancelarLancamento",
        })

    }


    cancelarLancamento(e) {
        e.preventDefault()

        $('body').find('#block-form-inventario #inner-lancamento-produto').slideUp('slow').html('')

        this.renderAutoCompleteCadastro()

    }



    save(e) {
        e.preventDefault()

        let form = utils.FormUtil.mapObject($('#block-form-inventario #form-lancamento-inventario'))

        if (!utils.UnderscoreUtil.valueTemplate(form, 'formObject.lancamento'))
            utils.MessageUtil.error(err)

        else {

            this._model.save(form.formObject.lancamento).then((r) => {

                utils.MessageUtil.message(r.message, 'info', {
                    buttons: {
                        'Fechar': (event) => {
                            utils.MessageUtil.closeButton(event)

                            let options = {
                                buttons: {
                                    'Novo Lançamento': (event) => {
                                        utils.MessageUtil.closeButton(event)
                                        this.renderCadastro()
                                    },
                                    'Voltar ao início': (event) => {
                                        utils.MessageUtil.closeButton(event)
                                        window.location.hash = "#ajuste-inventario/pesquisa"
                                        new AjusteInventarioListView()
                                    }
                                }
                            }

                            utils.MessageUtil.message('Escolha uma das opções a baixo:', 'info', options)
                        }
                    }
                })
            }).catch((err) => {
                utils.MessageUtil.error(err)
            })

        }


    }



    renderAutoCompleteCadastro() {

        utils.UnderscoreUtil._template('#template-inventario-lancamento-produto-autocomplete', {}, '#inner-produto-autocomplete')

        utils.AutoCompleteUtil.AutoComplete({

            type: 'produto',

            bloco: '#block-form-inventario #bloco-autocomplete-produto-inventario',
            input: '#block-form-inventario #form-lancamento-inventario #lancamento-produto-id',
            isClearValue: true,

            callback: (item) => {

                $('body').find('#block-form-inventario #inner-lancamento-produto').slideUp('slow').html('')

                utils.UnderscoreUtil._template('#template-inventario-lancamento-produto', { inventario: item.data }, '#inner-lancamento-produto')

                $('body').find('#block-form-inventario #inner-lancamento-produto').slideDown('slow')


                renderOperacao('#block-form-inventario #form-lancamento-inventario #lancamento-operacao')


                $('#block-form-inventario #form-cadastro #inner-produto-autocomplete').html('')
            }

        })
    }

    renderCadastro(data = {}) {

        try {
            this.breadCrumbs()

            utils.HtmlUtil.loader()

            this._bread.add('Novo Lançamento').show()

            utils.UnderscoreUtil._template('#template-cadastro-inventario', {}, '#inner-content')
            utils.UnderscoreUtil._template('#template-children-cadastro-inventario', { form: data }, '#inner-content-children')

            this.renderAutoCompleteCadastro()


        } catch (err) {
            utils.MessageUtil.error(err)
        }
    }


    render(inventario) {
        try {

            utils.HtmlUtil.loader()

            this._bread.show()

            this.renderCadastro(inventario)

        } catch (err) {
            utils.MessageUtil.message(err, 'danger')
        }
        return this
    }

}

module.exports = {
    AjusteInventarioView: () => { return new AjusteInventarioView() },
    AjusteInventarioListView: () => { return new AjusteInventarioListView() }
} 