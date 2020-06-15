
class ContaReceberListView extends Backbone.View {

    constructor() {
        super()

        this._bread = new utils.BreadCrumb()

        this.breadCrumbs()

        this._pathUrl = Backbone.history.getFragment()


        this._model = new ContaReceberModel()

        this.$el = $('body')

        this.overrideEvents()

        this.render()
    }

    breadCrumbs() {
        this._bread.add('inicio', '#home')
            .add('Fábricas', '#cadastro-de-fabricas')
    }

    reset() {
        this.$el.off('click', '#block-list-fabrica #btn-novo-cadastro')
        this.$el.off('click', '#block-form-fabrica #form-cadastro #save')
        this.$el.off('click', '#block-list-fabrica .btn-editar-cadastro')
    }


    overrideEvents() {
        this.reset()


        this.delegateEvents({
            "click #block-list-fabrica #btn-novo-cadastro": "renderCadastro",
            "click #block-form-fabrica #form-cadastro #save": "save",
            "click #block-list-fabrica .btn-editar-cadastro": "edit"
        })

    }



    save(e) {
        e.preventDefault()

        this._model.save($('#block-form-conta-receber #form-cadastro')).then((r) => {

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


        window.location.hash = "#cadastro-de-fabricas/edicao-cadastro-fabricas"

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

            let municipioSelecionado = ''

            try{
                municipioSelecionado = data.endereco.municipioId
            }catch(err){

            }

            
                
            utils.UnderscoreUtil._template('#template-cadastro-fabrica', {}, '#inner-content')
            utils.UnderscoreUtil._template('#template-children-cadastro-fabricas', { form: data }, '#inner-content-children')


            $.when(utils.EstadoMunicipioUtil.estadoMunicipioSelectBox({
                municipio : municipioSelecionado
            }))

            utils.JqueryUtil.initializeComponentesJquery()
            utils.MaskInputUtil.mask()
            

        } catch (err) {
            utils.MessageUtil.error(err)
        }
    }

    renderList() {
        this._model.listAll().then((r) => {

            

            //Template layout.pug
            utils.UnderscoreUtil._template('#template-financeiro-receita', {}, '#inner-content')

            //template receita.pug
            utils.UnderscoreUtil._template('#template-children-financeiro-receita', {}, '#inner-content-children')

            //template receitas
            utils.UnderscoreUtil._template('#template-children-financeiro-receita-list', { recebimentos : r.data }, '#inner-content-children-financeiro-receita')

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