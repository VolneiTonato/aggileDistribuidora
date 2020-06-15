let utils  = require('../../../helpers/utils-admin')




class UsuarioModel extends utils.BackboneModelUtil {

    constructor() {
        super()


    }

    defaults() {

    }

    listStatus(){
        return [
            {text:"Ativo", value:"ativo"},
            {text:"Inativo", value:"inativo"},
        ]
    }


    model(form) {
        return utils.FormUtil.mapObject(form)
    }

    async save(data) {
        this.url = utils.UrlUtil.url(`admin/usuarios/save`)

        let send = { data: this.model(data).formObject, type: 'POST' }

        return await this.fetch(send)
    }

    async listAll() {

        this.url = utils.UrlUtil.url(`admin/usuarios/list`)

        let send = { type: 'GET' }

        return await this.fetch(send)
    }
}

class UsuarioListView extends Backbone.View{
    constructor() {
        super()

        this._bread = new utils.BreadCrumb()

        this.breadCrumbs()

        this._pathUrl = Backbone.history.getFragment()


        this._model = new UsuarioModel()

        this.$el = $('body')

        this.overrideEvents()

        this.render()
    }

    breadCrumbs() {
        this._bread.add('inicio', '#home')
            .add('Usuários', '#cadastro-de-usuarios')
    }

    reset() {
        this.$el.off('click', '#block-list-usuario .btn-editar-cadastro')
    }


    overrideEvents() {
        this.reset()


        this.delegateEvents({
            "click #block-list-usuario .btn-editar-cadastro": "edit",
        })

    }

    edit(e) {
        e.preventDefault()

        let data = utils.JsonUtil.toParse($(e.currentTarget).closest('.row-item-list').attr('data-item'))


        window.location.hash = "#cadastro-de-usuarios/edicao-cadastro-usuarios"

        new UsuarioView(data)
    }

    renderList() {
        this._model.listAll().then((r) => {
            utils.UnderscoreUtil._template('#template-cadastro-usuario', {   }, '#inner-content')
            utils.UnderscoreUtil._template('#template-children-cadastro-list-usuarios', { usuarios: r }, '#inner-content-children')
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

class UsuarioView extends Backbone.View {

    constructor(usuario = {}) {
        super()

        this._bread = new utils.BreadCrumb()

        this.breadCrumbs()

        this._pathUrl = Backbone.history.getFragment()


        this._model = new UsuarioModel()

        this.$el = $('body')

        this.overrideEvents()

        this.render(usuario)
    }

    breadCrumbs() {
        this._bread.add('inicio', '#home')
            .add('Usuários', '#cadastro-de-usuarios')
    }

    reset() {
        this.$el.off('click', '#block-form-usuario #form-cadastro #save')
        this.$el.off('click', '#block-form-usuario #btn-novo-cadastro')
    }


    overrideEvents() {
        this.reset()


        this.delegateEvents({
            "click #block-form-usuario #form-cadastro #save": "save",
            'click #block-form-usuario #btn-novo-cadastro': (e) => {
                e.preventDefault()
                new UsuarioView()
            }
        })

    }



    save(e) {
        e.preventDefault()

        this._model.save($('#block-form-usuario #form-cadastro')).then((r) => {

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


    renderCadastro(data = {}) {

        try {
            this.breadCrumbs()

            utils.HtmlUtil.loader()

            if (data.id === undefined)
                this._bread.add('Novo Cadastro').show()
            else
                this._bread.add(`Edição de Cadastro ${data.id}`).show()

            utils.UnderscoreUtil._template('#template-cadastro-usuario', {}, '#inner-content')
            utils.UnderscoreUtil._template('#template-children-cadastro-usuarios', { form: data }, '#inner-content-children')

            
            utils.ApiUtil.listPermissoesUsuario().then( (permissoes) => {
                let html = ''
                permissoes.forEach( (item) => {
                    html += `<div class="checkbox-inline">
                        <label>
                            <input ${_.isArray(data.permissao) && (data.permissao.indexOf(item.value) !== -1 ? 'checked' : '')} name="permissao[]" type="checkbox" value=${item.value} />
                            ${item.text}
                        </label>
                    </div>`
                })
                $('#bloco-permissao').html(html)
            })

           
            this._model.listStatus().forEach( (item) => {
                $("#status").append(`<option ${data.status !== '' && data.status === item.value ? 'selected' : ''}  value="${item.value}">${item.text}</option>`)
            })

            

        } catch (err) {
            utils.MessageUtil.error(err)
        }
    }

    render(usuario) {
        try {

            utils.HtmlUtil.loader()

            this._bread.show()

            this.renderCadastro(usuario)

        } catch (err) {
            utils.MessageUtil.message(err, 'danger')
        }
        return this
    }

}

module.exports = {
    UsuarioListView : () => { return new UsuarioListView() },
    UsuarioView: () => { return new UsuarioView() }
} 