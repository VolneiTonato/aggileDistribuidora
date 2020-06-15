let utils = require('../../../../../helpers/utils-admin')
let produtoModel = require('../../models/produto')
let async = require("async")


module.exports = class ProdutoRepasseEcommerceView extends Backbone.View {

    constructor() {

        super()

        this._model = new produtoModel()

        this.$el = $('body')

        this.overrideEvents()

        this._modalElement = undefined

        this.render()
    }

    reset() {
        this.$el.off('click', '#block-list-produto-repasse-ecommerce #btn-novo-cadastro')
        this.$el.off('click', '#block-list-produto-repasse-ecommerce .btn-editar-cadastro')
        this.$el.off('click', '#block-list-produto-repasse-ecommerce .carregar-mais')
        this.$el.off('click', '#block-list-produto-repasse-ecommerce .pesquisar')
        this.$el.off('click', '#block-list-produto-repasse-ecommerce .limpar-pesquisa')
        this.$el.off('click', '#block-list-produto-repasse-ecommerce .btn-mais-opcoes')
        this.$el.off('click', '#block-list-produto-repasse-ecommerce-form-outros-campos .save')
        this.$el.off('click', '#block-list-produto-repasse-ecommerce-form-outros-campos .save')
        this.$el.off('click', '#block-list-produto-repasse-ecommerce .salvar-geral')
    }

    overrideEvents() {
        this.reset()


        this.delegateEvents({
            "click #block-list-produto-repasse-ecommerce #btn-novo-cadastro": "renderCadastro",
            "click #block-list-produto-repasse-ecommerce .btn-editar-cadastro": "edit",
            'click #block-list-produto-repasse-ecommerce .carregar-mais': 'carregarMaisItensCadastro',
            'click #block-list-produto-repasse-ecommerce .pesquisar': 'pesquisarProdutos',
            'click #block-list-produto-repasse-ecommerce .limpar-pesquisa': 'limparPesquisaProduto',
            'click #block-list-produto-repasse-ecommerce .btn-mais-opcoes':'maisCamposEdit',
            'click #block-list-produto-repasse-ecommerce-form-outros-campos .save': 'saveItemMemory',
            'click #block-list-produto-repasse-ecommerce .salvar-geral': 'saveAllAltered'
        })
    }

    async saveAllAltered(e){
        e.preventDefault()


        let type = '#inner-produtos-cadastrados-desktop'

        if($(e.currentTarget).hasClass('btn-is-mobile'))
            type = '#inner-produtos-cadastrados-mobile'


        let itens = []


        $(`#block-list-produto-repasse-ecommerce ${type} .row-item-list`).each((i, item) => {
            let data = utils.JsonUtil.toParse($(item).attr('data-item'))
            let formData = utils.FormUtil.mapObject($(item)).formObject

            let isAltered = false
            

            let fields = ['isEcommerce','isDestaque', 'precoVenda', 'promocao', 'estoque'].forEach(item => {
                
                
                if(!data.produtoEcommerce)
                    data.produtoEcommerce = {}

                if(!utils.ObjectUtil.is(data.produtoEcommerce, item)){
                    isAltered = true
                    data.produtoEcommerce[item] = formData.produtoEcommerce[item]
                
                }else if(data.produtoEcommerce[item] != formData.produtoEcommerce[item]){
                    isAltered = true
                    data.produtoEcommerce[item] = formData.produtoEcommerce[item]
                }
            })

            if(isAltered){
                $(`#block-list-produto-repasse-ecommerce .row-item-${data.id}`).attr('data-item', utils.JsonUtil.toString(data))
                $(item).attr('altered', true)
            }


            let idx = _.findIndex(itens, {id : data.id})

            if(idx == -1)
                itens.push(data)
        })


        async.forEachSeries(itens, (item, next) => {

            this._model.saveToEcommerce(item, false)
                .then(ok => next(null))
                .catch(err => next(err))

        }, async (err) => {
            if (err)
                return await utils.MessageUtil.error(err)
            else
                return await utils.MessageUtil.alert('Produtos(s) salvo com sucesso!', 'success')
        })

        
    }

    async saveItemMemory(e){
        e.preventDefault()

        let data = utils.FormUtil.mapObject($(e.currentTarget).closest('#block-list-produto-repasse-ecommerce-form-outros-campos')).formObject

        let block = $(`body #block-list-produto-repasse-ecommerce .row-item-${data.id}`)



        let element = utils.JsonUtil.toParse($(block).attr('data-item'))

        $.extend(true, element, data)

        $(block).attr('data-item', utils.JsonUtil.toString(element))

        $(block).attr("altered",true)


        utils.ModalUtil.forceCloseButton(`${this._modalElement}`)

        return await utils.MessageUtil.alert('Produto Ecommerce atualizado com sucesso!', 'info')


        
    }


    async maisCamposEdit(e){
        e.preventDefault()

        let data = utils.JsonUtil.toParse($(e.currentTarget).closest('.row-item-list').attr('data-item'))

        let html = await utils.UnderscoreUtil._template("#template-form-outros-campos-produto-ecommerce", { form: data })


        let modal = await utils.ModalUtil.modalVTT(html, `Integração Ecommerce`,{buttonClose : true})

        this._modalElement = modal.element

        $(modal.element).dialog(modal.config).dialog('open')

        
    }


    carregarMaisItensCadastro(e) {
        e.preventDefault()

        $('#block-list-produto-repasse-ecommerce .carregar-mais').attr({ 'disabled': true })

        this.carregarProdutos({ append: true })
    }


    getFormPesquisaCache() {
        let form = {}

        if (utils.localStorageUtil.isStorageItem('ultima_pesquisa_produtos_cadastro_repasse_ecommerce'))
            form = utils.localStorageUtil.getStorage('ultima_pesquisa_produtos_cadastro_repasse_ecommerce')

        return form
    }

    limparPesquisaProduto(e) {
        e.preventDefault()



        utils.localStorageUtil.removeStorage('ultima_pesquisa_produtos_cadastro_repasse_ecommerce')

        utils.localStorageUtil.removeStorage('list_grupos_produto_cadastroform_pesquisa_produtos_cadastro')

        this.renderFormPesquisa({ isClear: true })
    }

    pesquisarProdutos(e) {
        e.preventDefault()

        this._model.paginatorReset()

        let form = utils.FormUtil.mapObject('#block-list-produto-repasse-ecommerce #form-pesquisa')


        utils.localStorageUtil.setStorage('ultima_pesquisa_produtos_cadastro_repasse_ecommerce', form.formObject.pesquisa)



        this.carregarProdutos()

    }




    renderFormPesquisa(options = {}) {

        let form = this.getFormPesquisaCache()




        utils.UnderscoreUtil._template("#template-form-pesquisa-produtos-repasse-ecommerce", { form: form }, '#inner-form-pesquisa-produto')


        utils.ApiUtil.listFabricas().then((fabricas) => {
            
            let select = $('#block-list-produto-repasse-ecommerce #form-pesquisa').find('#pesquisa-fabricaId')
            select.append('<option value="">Selecione...</option>')
            fabricas.forEach((item) => {
                select.append(`<option value="${item.id}" ${item.id == form.fabricaId ? 'selected' : ''} >${item.nomeFantasia} - ${item.razaoSocial}</option>`)
            })
        })

        let gruposTreeView = (data = {}) => {



            let overlay = $(`#block-list-produto-repasse-ecommerce #form-pesquisa #grupos-tree-view`).closest('.form-group').find('.overlay')

            overlay.show()

            utils.ApiUtil.listGruposTreeView(data.grupoId, { isNotSelectededItem: true }, { cacheName: 'form_pesquisa_produto' }).then((r) => {

                $('#block-list-produto-repasse-ecommerce #grupos-tree-view').jstree({
                    core: { data: r },
                    "conditionalselect": function (node, event) {
                        return node.children.length === 0

                    },
                    "plugins": ["conditionalselect"]
                })

                overlay.hide()

                $('#block-list-produto-repasse-ecommerce #grupos-tree-view')
                    .off("changed.jstree")
                    .on("changed.jstree", (e, node) => {

                        if (parseInt(node.selected) > 0)
                            $('#block-list-produto-repasse-ecommerce #form-pesquisa').find('#pesquisa-grupoId').val(node.selected)
                        else
                            $('#block-list-produto-repasse-ecommerce #form-pesquisa').find('#pesquisa-grupoId').val('')
                    })
            }).catch((err) => {
                overlay.hide()
            })


        }

        gruposTreeView(form)

    }


    carregarProdutos(options = {}) {

        let form = this.getFormPesquisaCache()

        let overlay = $(`#block-list-produto-repasse-ecommerce #overlay-painel-list-cadastro`).find('.overlay')

        overlay.show()

        this._model.listAll(form).then((r) => {

            this.renderProdutos(r, options)

            overlay.hide()


        }).catch((err) => {
            utils.MessageUtil.error(err)
        })
    }

 


    renderProdutos(data = {}, options = {}) {

        _.assign(options, { isDesktopMobile: true, closeLoader: true })

        utils.UnderscoreUtil._template('#template-list-table-produtos-cadastrados-repasse-ecommerce', { produtos: data }, '#inner-produtos-cadastrados', options)


        data.forEach(item => {

            

            try {
                let element = $('#block-list-produto-repasse-ecommerce').find(`.row-item-${item.id}`)

                
                utils.ApiUtil.listBooleanSimNao().forEach(item => {
                    $(element).find('select.produto-ecommerce-is-ecommerce').append(`<option value="${item.value}" ${item.value == false ? 'selected': ''}>${item.text}</option>`)
                    $(element).find('select.produto-ecommerce-is-destaque').append(`<option value="${item.value}" ${item.value == false ? 'selected': ''}>${item.text}</option>`)

                })

                $(element).find(`.produto-ecommerce-is-ecommerce option[value="${utils.ObjectUtil.getValueProperty(item,'produtoEcommerce.isEcommerce')}"]`).prop('selected', true)
                $(element).find(`.produto-ecommerce-is-destaque option[value="${utils.ObjectUtil.getValueProperty(item,'produtoEcommerce.isDestaque')}"]`).prop('selected', true)

            } catch (err) {

            }

        })


        if (data.length > 0)
            $('#block-list-produto-repasse-ecommerce .carregar-mais').attr({ 'disabled': false })
    }


    renderTela() {

        try {


            //Template layout.pug
            utils.UnderscoreUtil._template('#template-cadastro-produto', {}, '#inner-content', { isLoader: true })

            //template produto.pug
            utils.UnderscoreUtil._template('#template-children-produto', {}, '#inner-content-children')

            //tempalte list.pug
            utils.UnderscoreUtil._template('#template-children-cadastro-list-produtos-repasse-ecommerce', {}, '#inner-content-children-produto')


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
