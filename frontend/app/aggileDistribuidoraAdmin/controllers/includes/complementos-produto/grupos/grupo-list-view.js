let utils = require('../../../../../../helpers/utils-admin')

let  GrupoModel = require('../../../models/grupo')

const GrupoView = require('./grupo-view')



class GrupoListView extends Backbone.View{

    constructor() {
        super()

        this._bread = new utils.BreadCrumb()

        this.breadCrumbs()

        this._pathUrl = Backbone.history.getFragment()

        this._model = new GrupoModel()
      

        this.$el = $('body')

        this.overrideEvents()

        this.render()
    }

    breadCrumbs() {
        this._bread.add('inicio', '#home')
            .add('Grupos', '#cadastro-de-grupos')
    }

    reset() {
        this.$el.off('click', '#block-list-grupo .btn-editar-cadastro')
        this.$el.off('click', '#block-list-grupo .carregar-mais')
    }


    overrideEvents() {
        this.reset()


        this.delegateEvents({
            "click #block-list-grupo .btn-editar-cadastro": "edit",
            'click #block-list-grupo .carregar-mais': 'carregarMaisItensCadastro',
        })

    }

    novoCadastro(e){
        e.preventDefault()


    }

    carregarMaisItensCadastro(e){
        e.preventDefault()

        $('#block-list-grupo .carregar-mais').attr({'disabled': true})

        this.carregarGrupos({append : true})
    }

    carregarGrupos(options = {}) {
        
        let overlay = $(`#block-list-grupo #overlay-painel-list-cadastro`).find('.overlay')

        overlay.show()

        this._model.listAll().then((r) => {

            this.renderGrupo(r, options)

            overlay.hide()


        }).catch((err) => {
            utils.MessageUtil.error(err)
        })
    }

    renderGrupo(data = {}, options = {}) {

        _.assign(options, { isDesktopMobile: true, closeLoader : true})

        utils.UnderscoreUtil._template('#template-list-table-grupos-cadastrados', { grupos: data }, '#inner-grupos-cadastrados', options)

        if(data.length > 0)
            $('#block-list-grupo .carregar-mais').attr({'disabled': false})
    }

    edit(e) {

        e.preventDefault()

        let data = utils.JsonUtil.toParse($(e.currentTarget).closest('.row-item-list').attr('data-item'))


        window.location.hash = "#cadastro-de-grupos/edicao-cadastro-grupos"

        new GrupoView(data)
    }


    renderTela() {

        try {


            utils.UnderscoreUtil._template('#template-cadastro-grupo', {}, '#inner-content', {isLoader : true})

            utils.UnderscoreUtil._template('#template-children-grupo', {}, '#inner-content-children')

            utils.UnderscoreUtil._template('#template-children-cadastro-list-grupos', {}, '#inner-content-children-grupo')

        } catch (err) {
            utils.MessageUtil.error(err)
        }
    }


    render() {
        try {

            utils.HtmlUtil.loader()

            this.renderTela()

            this.carregarGrupos()

        } catch (err) {
            utils.MessageUtil.message(err, 'danger')
        }
        return this
    }


}


module.exports = GrupoListView