let  utils = require('../../../helpers/utils-admin')



class AuthModel extends utils.BackboneModelUtil {

    constructor() {
        super()
    }

    defaults() {

    }



    async save(data) {
        this.url = utils.UrlUtil.url(`admin/volumes/save`)

        let send = { data: this.model(data).formObject, type: 'POST' }

        return await this.fetch(send)
    }

    async listAll() {

        this.url = utils.UrlUtil.url(`admin/volumes/list`)

        let send = { type: 'GET' }

        return await this.fetch(send)
    }
}

class AuthView extends Backbone.View {

    constructor() {
        super()

        this._bread = new utils.BreadCrumb()

        this._pathUrl = Backbone.history.getFragment()


        this._model = new AuthModel()

        this.$el = $('body')

        this.overrideEvents()

        this.render()
    }

    reset() {
        this.$el.off('click', '#btn-novo-cadastro')
        this.$el.off('click', '#form-cadastro #save')
        this.$el.off('click', '.btn-editar-cadastro')
    }


    overrideEvents() {
        this.reset()


        this.delegateEvents({
            "click #btn-novo-cadastro": "renderCadastro",
            "click #form-cadastro #save": "save",
            "click .btn-editar-cadastro": "edit"
        })

    }



    save(e) {
        e.preventDefault()

        this._model.save($('#form-cadastro')).then((r) => {

            utils.MessageUtil.message(r.message, 'info', {
                buttons: {
                    'Fechar': (event) => {
                        utils.MessageUtil.closeButton(event)
                        this.renderCadastro(e, r.data)
                    }
                }
            })
        }).catch((err) => {
            utils.MessageUtil.error(err)
        })


    }


    edit(e) {
        e.preventDefault()

        let data = utils.JsonUtil.toParse($(e.currentTarget).closest('.row-item-list').attr('data-item'))


        window.location.hash = "#cadastro-de-volumes/edicao-cadastro-volumes"

        this.renderCadastro(e, data)
    }

    renderCadastro(e, data = {}) {

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

    renderList() {
        this._model.listAll().then((r) => {
            utils.UnderscoreUtil._template('#template-cadastro-volume', {   }, '#inner-content')
            utils.UnderscoreUtil._template('#template-children-cadastro-list-volumes', { fabricas: r }, '#inner-content-children')
        }).catch((err) => {
            utils.MessageUtil.error(err)
        })
    }

    render() {
        try {

            utils.HtmlUtil.loader()

            this._bread.show()

            this.renderList()

        } catch (err) {
            utils.MessageUtil.message(err, 'danger')
        }
        return this
    }

}

module.exports.AuthView = () => {
    return new AuthView()
} 