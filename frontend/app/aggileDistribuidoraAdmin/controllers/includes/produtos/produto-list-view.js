let utils = require('../../../../../helpers/utils-admin')
let produtoModel = require('../../models/produto')

const produtoView = require('./produto-view')

module.exports = class ProdutoListView extends Backbone.View {

    constructor() {

        super()

        this._model = new produtoModel()

        this.$el = $('body')

        this.overrideEvents()

        this.render()
    }

    reset() {
        this.$el.off('click', '#block-list-produto #btn-novo-cadastro')
        this.$el.off('click', '#block-list-produto .btn-editar-cadastro')
        this.$el.off('click', '#block-list-produto .carregar-mais')
        this.$el.off('click', '#block-list-produto .pesquisar')
        this.$el.off('click', '#block-list-produto .limpar-pesquisa')
    }

    overrideEvents() {
        this.reset()


        this.delegateEvents({
            "click #block-list-produto #btn-novo-cadastro": "renderCadastro",
            "click #block-list-produto .btn-editar-cadastro": "edit",
            'click #block-list-produto .carregar-mais': 'carregarMaisItensCadastro',
            'click #block-list-produto .pesquisar': 'pesquisarProdutos',
            'click #block-list-produto .limpar-pesquisa': 'limparPesquisaProduto',
        })
    }


    edit(e) {
        e.preventDefault()

        let data = utils.JsonUtil.toParse($(e.currentTarget).closest('.row-item-list').attr('data-item'))

        window.location.hash = "#cadastro-de-produtos/edicao-cadastro-produtos"

        new produtoView(data)
    }

    carregarMaisItensCadastro(e) {
        e.preventDefault()

        $('#block-list-produto .carregar-mais').attr({ 'disabled': true })

        this.carregarProdutos({ append: true })
    }


    getFormPesquisaCache() {
        let form = {}

        if (utils.localStorageUtil.isStorageItem('ultima_pesquisa_produtos_cadastro'))
            form = utils.localStorageUtil.getStorage('ultima_pesquisa_produtos_cadastro')

        return form
    }

    limparPesquisaProduto(e) {
        e.preventDefault()



        utils.localStorageUtil.removeStorage('ultima_pesquisa_produtos_cadastro')

        utils.localStorageUtil.removeStorage('list_grupos_produto_cadastroform_pesquisa_produtos_cadastro')

        this.renderFormPesquisa({ isClear: true })
    }

    pesquisarProdutos(e) {
        e.preventDefault()

        this._model.paginatorReset()

        let form = utils.FormUtil.mapObject('#block-list-produto #form-pesquisa')


        utils.localStorageUtil.setStorage('ultima_pesquisa_produtos_cadastro', form.formObject.pesquisa)



        this.carregarProdutos()

    }




    renderFormPesquisa(options = {}) {

        let form = this.getFormPesquisaCache()




        utils.UnderscoreUtil._template("#template-form-pesquisa-produtos", { form: form }, '#inner-form-pesquisa-produto')


        utils.ApiUtil.listFabricas().then((fabricas) => {
            let select = $('#block-list-produto #form-pesquisa').find('#pesquisa-fabricaId')
            select.append('<option value="">Selecione...</option>')
            fabricas.forEach((item) => {
                select.append(`<option value="${item.pessoaId}" ${item.pessoaId == form.fabricaId ? 'selected' : ''} >${item.nomeFantasia} - ${item.razaoSocial}</option>`)
            })
        })



        

        let select = $('#block-list-produto #form-pesquisa').find('#pesquisa-status')
        select.append('<option value="">Todos</option>')
        utils.ApiUtil.listBooleanSimNao().forEach(item => {
            select.append(`<option value="${item.value}" ${ item.value == utils.StringUtil.stringToBoolean(form.status) && ['true', 'false'].indexOf(form.status) !== -1 ? 'selected' : ''} >${item.text}</option>`)
        })

        let gruposTreeView = (data = {}) => {



            let overlay = $(`#block-list-produto #form-pesquisa #grupos-tree-view`).closest('.form-group').find('.overlay')

            overlay.show()

            utils.ApiUtil.listGruposTreeView(data.grupoId, { isNotSelectededItem: true }, { cacheName: 'form_pesquisa_produto' }).then((r) => {

                $('#block-list-produto #grupos-tree-view').jstree({
                    core: { data: r },
                    "conditionalselect": function (node, event) {
                        return node.children.length === 0

                    },
                    "plugins": ["conditionalselect"]
                })

                overlay.hide()

                $('#block-list-produto #grupos-tree-view')
                    .off("changed.jstree")
                    .on("changed.jstree", (e, node) => {

                        if (parseInt(node.selected) > 0)
                            $('#block-list-produto #form-pesquisa').find('#pesquisa-grupoId').val(node.selected)
                        else
                            $('#block-list-produto #form-pesquisa').find('#pesquisa-grupoId').val('')
                    })
            }).catch((err) => {
                overlay.hide()
            })


        }

        gruposTreeView(form)

    }


    carregarProdutos(options = {}) {

        let form = this.getFormPesquisaCache()

        let overlay = $(`#block-list-produto #overlay-painel-list-cadastro`).find('.overlay')

        overlay.show()

        this._model.listAll(form).then((r) => {

            this.renderProdutos(r, options)

            overlay.hide()


        }).catch((err) => {
            utils.MessageUtil.error(err)
        })
    }

    /*
        scrolList() {
    
    
            const callbackScroll = () => {
    
                utils.HtmlUtil.loader(undefined, undefined, '#inner-produtos-cadastrados', { isDesktopMobile: true, append: true})
    
                this._model.listAll().then((r) => {
    
                    this.renderProdutos(r, { append: true })
    
                }).catch((err) => {
                    utils.MessageUtil.error(err)
                })
            }
    
            utils.JqueryUtil.scrollAjax('#block-list-produto', {}, callbackScroll)
        }*/


    renderProdutos(data = {}, options = {}) {

        _.assign(options, { isDesktopMobile: true, closeLoader: true })

        utils.UnderscoreUtil._template('#template-list-table-produtos-cadastrados', { produtos: data }, '#inner-produtos-cadastrados', options)


        if (data.length > 0)
            $('#block-list-produto .carregar-mais').attr({ 'disabled': false })
    }


    renderTela() {

        try {


            //Template layout.pug
            utils.UnderscoreUtil._template('#template-cadastro-produto', {}, '#inner-content', { isLoader: true })

            //template produto.pug
            utils.UnderscoreUtil._template('#template-children-produto', {}, '#inner-content-children')

            //tempalte list.pug
            utils.UnderscoreUtil._template('#template-children-cadastro-list-produtos', {}, '#inner-content-children-produto')


            this.renderFormPesquisa()
        } catch (err) {
            utils.MessageUtil.error(err)
        }
    }



    render() {
        try {

            utils.HtmlUtil.loader()

            //this._bread.show()

            this.renderTela()

            this.carregarProdutos()



        } catch (err) {
            utils.MessageUtil.message(err, 'danger')
        }
        return this
    }


}
