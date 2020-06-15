let utils = require('../../../helpers/utils-admin')
let enderecoView = require('./includes/endereco-view')


let paginator = utils.PaginatorUtil.paginator()

class FabricaModel extends utils.BackboneModelUtil {

    constructor() {
        super()


    }

    defaults() {

    }


    model(form) {
        return utils.FormUtil.mapObject(form)
    }

    async save(data) {
        this.url = utils.UrlUtil.url(`admin/fabricas/save`)


        //let send = { data: this.model(data).formObject, type: 'POST'}
        let send = { data: this.model(data).formObject, type: 'POST', table : 'fabricas', operacao : 'save' }

        return await this.fetch(send)
    }

    async listAll(data = {}) {

        _.assign(data, paginator)
        
        this.url = utils.UrlUtil.url(`admin/fabricas/list`)

        let send = { type: 'POST', data : data }

        let retorno = await this.fetch(send)

        if (retorno && (retorno.length > 0)) 
            paginator = utils.PaginatorUtil.calcularPaginator(paginator)
        

        return retorno
    }
}

class FabricaListView extends Backbone.View{
    constructor(){
        super()

        this._model = new FabricaModel()

        paginator = utils.PaginatorUtil.paginator()

        this.$el = $('body')

        this.overrideEvents()

        this.render()
    }


    reset() {
        this.$el.off('click', '#block-list-fabrica #btn-novo-cadastro')
        this.$el.off('click', '#block-list-fabrica .btn-editar-cadastro')
        this.$el.off('click', '#block-list-fabrica .carregar-mais')
    }

    overrideEvents() {
        this.reset()


        this.delegateEvents({
            'click #block-list-fabrica .carregar-mais': 'carregarMaisItensCadastro',
            "click #block-list-fabrica #btn-novo-cadastro": "renderCadastro",
            "click #block-list-fabrica .btn-editar-cadastro": "edit"
        })
    }

    edit(e) {
        e.preventDefault()

        let data = utils.JsonUtil.toParse($(e.currentTarget).closest('.row-item-list').attr('data-item'))

        window.location.hash = "#cadastro-de-fabricas/edicao-cadastro-fabrica"

        new FabricaView(data)
    }

    carregarMaisItensCadastro(e){
        e.preventDefault()

        $('#block-list-fabrica .carregar-mais').attr({'disabled': true})

        this.carregarFabricas({append : true})
    }


    carregarFabricas(options = {}) {
        
        let overlay = $(`#block-list-fabrica #overlay-painel-list-cadastro`).find('.overlay')

        overlay.show()

        this._model.listAll().then((r) => {

            this.renderFabricas(r, options)

            overlay.hide()


        }).catch((err) => {
            utils.MessageUtil.error(err)
        })
    }

    renderFabricas(data = {}, options = {}) {

        _.assign(options, { isDesktopMobile: true, closeLoader : true})

        utils.UnderscoreUtil._template('#template-list-table-fabricas-cadastradas', { fabricas: data }, '#inner-fabricas-cadastradas', options)

        if(data.length > 0)
            $('#block-list-fabrica .carregar-mais').attr({'disabled': false})
    }

    renderTela() {

        try {


            utils.UnderscoreUtil._template('#template-cadastro-fabrica', {}, '#inner-content', {isLoader : true})

            utils.UnderscoreUtil._template('#template-children-fabrica', {}, '#inner-content-children')

            utils.UnderscoreUtil._template('#template-children-cadastro-list-fabricas', {}, '#inner-content-children-fabrica')

        } catch (err) {
            utils.MessageUtil.error(err)
        }
    }


    render() {
        try {

            utils.HtmlUtil.loader()

            this.renderTela()

            this.carregarFabricas()

        } catch (err) {
            utils.MessageUtil.message(err, 'danger')
        }
        return this
    }


}

class FabricaView extends Backbone.View {

    constructor(fabrica = {}) {
        super()

        this._bread = new utils.BreadCrumb()

        this.breadCrumbs()

        this._pathUrl = Backbone.history.getFragment()

        paginator = utils.PaginatorUtil.paginator()

        this._model = new FabricaModel()

        this.$el = $('body')

        this.overrideEvents()

        this.render(fabrica)
    }

    breadCrumbs() {
        this._bread.add('inicio', '#home')
            .add('Fábricas', '#cadastro-de-fabricas')
    }

    reset() {
        this.$el.off('click', '#block-form-fabrica #form-cadastro #save')
        this.$el.off('click', '#block-form-fabrica #btn-novo-cadastro')
    }


    overrideEvents() {
        this.reset()


        this.delegateEvents({
            "click #block-form-fabrica #form-cadastro #save": "save",
            'click #block-form-fabrica #btn-novo-cadastro': (e) => {
                e.preventDefault()
                new FabricaView()
            }
        })

    }



    save(e) {
        e.preventDefault()

        this._model.save($('#block-form-fabrica #form-cadastro')).then((r) => {

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
                municipioSelecionado = data.endereco.municipioId
            } catch (err) {

            }



            utils.UnderscoreUtil._template('#template-cadastro-fabrica', {}, '#inner-content')
            utils.UnderscoreUtil._template('#template-children-cadastro-fabricas', { form: data }, '#inner-content-children')


            $.when(utils.EstadoMunicipioUtil.estadoMunicipioSelectBox({
                municipio: municipioSelecionado
            }))

            let blockTelefone = new utils.TelefoneUtil('#block-form-fabrica #form-cadastro','#inner-telefone-fabrica')

            if(data.telefones && (data.telefones.length > 0))
                await blockTelefone.addListaTelefones(data.telefones)
            else
                await blockTelefone.add()


            new utils.LocationUtil('#block-form-fabrica #form-cadastro')

            new enderecoView.EnderecoListVew('#block-form-fabrica #form-cadastro', data.enderecos, {tipoPessoa : 'fabrica', pessoaId : data.id})


        } catch (err) {
            utils.MessageUtil.error(err)
        }
    }

    render(fabrica = {}) {
        try {

            utils.HtmlUtil.loader()

            this._bread.show()

            this.renderCadastro(fabrica)

        } catch (err) {
            utils.MessageUtil.message(err, 'danger')
        }
        return this
    }

}

module.exports =  {
    FabricaView : () => { return new FabricaView()},
    FabricaListView : () => {return new FabricaListView()}
} 