module.exports = {
    VolumeView: () => { return new (require('./includes/complementos-produto/volumes/volume-view'))() },
    VolumeListView: () => { return new (require('./includes/complementos-produto/volumes/volume-list-view'))() }
} 

/*
let utils = require('../../../helpers/utils-admin')


let paginator = utils.PaginatorUtil.paginator()

class VolumeModel extends utils.BackboneModelUtil {

    constructor() {
        super()


    }

    defaults() {

    }


    model(form) {
        return utils.FormUtil.mapObject(form)
    }

    async save(data) {
        this.url = utils.UrlUtil.url(`admin/volumes/save`)

        //let item = utils.JsonUtil.toParse($(data).find('#row-item').attr('data-item'))

        let send = { data: this.model(data).formObject, type: 'POST', table : 'volumes', operacao : 'save'}

        //let send = { data: this.model(data).formObject, type: 'POST' }

        return await this.fetch(send)
    }

    async listAll(data = {}) {

        _.assign(data, paginator)

        this.url = utils.UrlUtil.url(`admin/volumes/list`)

        let send = { type: 'POST', data : data }

        let retorno = await this.fetch(send)

        if (retorno && (retorno.length > 0)) 
            paginator = utils.PaginatorUtil.calcularPaginator(paginator)
        

        return retorno
    }
}

class VolumeListView extends Backbone.View{

    constructor() {
        super()

        this._bread = new utils.BreadCrumb()

        this.breadCrumbs()

        this._pathUrl = Backbone.history.getFragment()

        paginator = utils.PaginatorUtil.paginator()


        this._model = new VolumeModel()

        this.$el = $('body')

        this.overrideEvents()

        this.render()
    }

    breadCrumbs() {
        this._bread.add('inicio', '#home')
            .add('Volumes', '#cadastro-de-volumes')
    }

    reset() {
        this.$el.off('click', '#block-list-volume #btn-novo-cadastro')
        this.$el.off('click', '#block-list-volume .btn-editar-cadastro')
        this.$el.off('click', '#block-list-volume .carregar-mais')
    }


    overrideEvents() {
        this.reset()


        this.delegateEvents({
            "click #block-list-volume #btn-novo-cadastro": "renderCadastro",
            "click #block-list-volume .btn-editar-cadastro": "edit",
            'click #block-list-volume .carregar-mais': 'carregarMaisItensCadastro',
        })

    }

    carregarMaisItensCadastro(e){
        e.preventDefault()

        $('#block-list-volume .carregar-mais').attr({'disabled': true})

        this.carregarVolumes({append : true})
    }

    carregarVolumes(options = {}) {
        
        let overlay = $(`#block-list-volume #overlay-painel-list-cadastro`).find('.overlay')

        overlay.show()

        this._model.listAll().then((r) => {

            this.renderVolumes(r, options)

            overlay.hide()


        }).catch((err) => {
            utils.MessageUtil.error(err)
        })
    }

    renderVolumes(data = {}, options = {}) {

        _.assign(options, { isDesktopMobile: true, closeLoader : true})

        utils.UnderscoreUtil._template('#template-list-table-volumes-cadastrados', { volumes: data }, '#inner-volumes-cadastrados', options)

        if(data.length > 0)
            $('#block-list-volume .carregar-mais').attr({'disabled': false})
    }

    edit(e) {

        e.preventDefault()

        let data = utils.JsonUtil.toParse($(e.currentTarget).closest('.row-item-list').attr('data-item'))


        window.location.hash = "#cadastro-de-volumes/edicao-cadastro-volumes"

        new VolumeView(data)
    }


    renderTela() {

        try {


            utils.UnderscoreUtil._template('#template-cadastro-volume', {}, '#inner-content', {isLoader : true})

            utils.UnderscoreUtil._template('#template-children-volume', {}, '#inner-content-children')

            utils.UnderscoreUtil._template('#template-children-cadastro-list-volumes', {}, '#inner-content-children-volume')

        } catch (err) {
            utils.MessageUtil.error(err)
        }
    }


    render() {
        try {

            utils.HtmlUtil.loader()

            this.renderTela()

            this.carregarVolumes()

        } catch (err) {
            utils.MessageUtil.message(err, 'danger')
        }
        return this
    }


}

class VolumeView extends Backbone.View {

    constructor(volume = {}) {
        super()

        this._bread = new utils.BreadCrumb()

        this.breadCrumbs()

        this._pathUrl = Backbone.history.getFragment()

        paginator = utils.PaginatorUtil.paginator()


        this._model = new VolumeModel()

        this.$el = $('body')

        this.overrideEvents()

        this.render(volume)
    }

    breadCrumbs() {
        this._bread.add('inicio', '#home')
            .add('Volumes', '#cadastro-de-volumes')
    }

    reset() {
        this.$el.off('click', '#block-form-volume #form-cadastro #save')
    }


    overrideEvents() {
        this.reset()


        this.delegateEvents({
            "click #block-form-volume #form-cadastro #save": "save",
        })

    }



    save(e) {
        e.preventDefault()

        this._model.save($('#block-form-volume #form-cadastro')).then((r) => {

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

    renderCadastro(data = {}) {

        try {
            this.breadCrumbs()

            utils.HtmlUtil.loader()

            if (data.id === undefined)
                this._bread.add('Novo Cadastro').show()
            else
                this._bread.add(`Edição de Cadastro ${data.id}`).show()


                
            utils.UnderscoreUtil._template('#template-cadastro-volume', {}, '#inner-content')
            utils.UnderscoreUtil._template('#template-children-cadastro-volumes', { form: data }, '#inner-content-children')
            

        } catch (err) {
            utils.MessageUtil.error(err)
        }
    }


    render(volume) {
        try {

            utils.HtmlUtil.loader()

            this._bread.show()

            this.renderCadastro(volume)

        } catch (err) {
            utils.MessageUtil.message(err, 'danger')
        }
        return this
    }

}

module.exports = {
    VolumeView : () => { return new VolumeView() },
    VolumeListView : () => { return new VolumeListView() }
} */