let utils = require('../../../../../../helpers/utils-admin')

const GrupoModel = require('../../../models/grupo')

class GrupoView extends Backbone.View {

    constructor(grupo = {}) {
        super()

        this._bread = new utils.BreadCrumb()

        this.breadCrumbs()

        this._pathUrl = Backbone.history.getFragment()


        this._model = new GrupoModel()

        this.$el = $('body')

        this.overrideEvents()

        this.render(grupo)
    }

    breadCrumbs() {
        this._bread.add('inicio', '#home')
            .add('Grupos', '#cadastro-de-grupos')
    }

    reset() {
        this.$el.off('click', '#block-form-grupo #form-cadastro #save')
        this.$el.off("click", '#block-form-grupo #btn-novo-cadastro')
    }


    overrideEvents() {
        this.reset()


        this.delegateEvents({
            "click #block-form-grupo #form-cadastro #save": "save",
            'click #block-form-grupo #btn-novo-cadastro': (e) => {
                e.preventDefault()
                new GrupoView()
            }
        })

    }


    gruposTreeView(data = {}) {

        let overlay = $(`#block-form-grupo #grupos-tree-view`).closest('.form-group').find('.overlay')
        
        overlay.show()

        utils.ApiUtil.listGruposTreeView(data.grupoPaiId).then((r) => {

            
            $('#block-form-grupo #grupos-tree-view').jstree({ 
                core: { data: r },
                "conditionalselect": function (node, event) {
                    return node.id !== $('#form-cadastro').find('#id').val()

                },
                "plugins": ["conditionalselect"]
            })

            overlay.hide()

            $('#block-form-grupo #grupos-tree-view')
                .off("changed.jstree")
                .on("changed.jstree", (e, node) => {
                    if (parseInt(node.selected) > 0)
                        $('#block-form-grupo #form-cadastro').find('#grupo-pai').val(node.selected)
                    else
                        $('#block-form-grupo #form-cadastro').find('#grupo-pai').val('')
                })
        }).catch((err) => {
            overlay.hide()
        })


    }


    save(e) {
        e.preventDefault()

        this._model.save($('#block-form-grupo #form-cadastro')).then((r) => {

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


            utils.UnderscoreUtil._template('#template-cadastro-grupo', {}, '#inner-content')
            utils.UnderscoreUtil._template('#template-children-cadastro-grupos', { form: data }, '#inner-content-children')

           

            this.gruposTreeView(data)

        } catch (err) {
            utils.MessageUtil.error(err)
        }
    }


    render(grupo = {}) {
        try {

            utils.HtmlUtil.loader()

            this._bread.show()

            this.renderCadastro(grupo)

        } catch (err) {
            utils.MessageUtil.message(err, 'danger')
        }
        return this
    }

}

module.exports = GrupoView