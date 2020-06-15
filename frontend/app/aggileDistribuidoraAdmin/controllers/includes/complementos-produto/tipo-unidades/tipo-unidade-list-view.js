let utils = require('../../../../../../helpers/utils-admin')

module.exports = class TipoUnidadeListView extends Backbone.View {

    constructor() {
        super()


        this._bread = new utils.BreadCrumb()

        this.breadCrumbs()

        this._pathUrl = Backbone.history.getFragment()

        this.$el = $('body')

        this.overrideEvents()

        process.nextTick(() => {
            this._model = new (require('../../../models/tipo-unidade'))()
            this._tipoUnidadeView = require('./tipo-unidade-view')
            this._formPesquisaView = require('./tipo-unidade-form-pesquisa-view')
            this.render()
        })


    }

    breadCrumbs() {
        this._bread.add('inicio', '#home')
            .add('Tipos Unidades', '#cadastro-de-tipos-unidades')
    }

    reset() {
        this.$el.off('click', '#block-list-tipo-unidade #btn-novo-cadastro')
        this.$el.off('click', '#block-list-tipo-unidade .btn-editar-cadastro')
        this.$el.off('click', '#block-list-tipo-unidade .carregar-mais')
    }


    overrideEvents() {
        this.reset()


        this.delegateEvents({
            "click #block-list-tipo-unidade #btn-novo-cadastro": "novoCadastro",
            "click #block-list-tipo-unidade .btn-editar-cadastro": "edit",
            'click #block-list-tipo-unidade .carregar-mais': 'carregarMaisItensCadastro'

        })


    }

    novoCadastro(e) {
        e.preventDefault()

        new this._tipoUnidadeView()
    }



    carregarMaisItensCadastro(e) {
        e.preventDefault()

        $('#block-list-tipo-unidade .carregar-mais').attr({ 'disabled': true })

        this.carregarTiposUnidades({ append: true })
    }

    carregarTiposUnidades(options = {}) {

        let overlay = $(`#block-list-tipo-unidade #overlay-painel-list-cadastro`).find('.overlay')

        overlay.show()


        this._model.listAll().then((r) => {

            this.renderTipoUnidades(r, options)

            overlay.hide()


        }).catch((err) => {
            utils.MessageUtil.error(err)
        })
    }

    async renderTipoUnidades(data = {}, options = {}) {

        _.assign(options, { isDesktopMobile: true, closeLoader: true })

        await utils.UnderscoreUtil._template('#template-list-table-tipos-unidades-cadastrados', { tipoUnidades: data }, '#inner-tipos-unidades-cadastrados', options)

        if (data.length > 0)
            $('#block-list-tipo-unidade .carregar-mais').attr({ 'disabled': false })

        new utils.TableUtil('#block-list-tipo-unidade')
    }

    updateRowEdit(data) {



        let rowDesktop = $('#block-list-tipo-unidade #inner-tipos-unidades-cadastrados-desktop').find(`[data-key=${data.id}]`).attr('data-key', data.id)

        let rowMobile = $('#block-list-tipo-unidade #inner-tipos-unidades-cadastrados-mobile').find(`[data-key=${data.id}]`).attr('data-key', data.id)

        if (rowDesktop && rowMobile) {


            let serialize = utils.JsonUtil.toString(data)

            $(rowDesktop).find('td:eq(0)').text(data.descricao)
            $(rowDesktop).attr('data-item', serialize)

            $(rowMobile).find('.mb-1:eq(0) > span').text(`${data.descricao}`)
            $(rowMobile).attr('data-item', serialize)
        }
    }

    edit(e) {
        e.preventDefault()

        let data = utils.JsonUtil.toParse($(e.currentTarget).closest('.row-item-list').attr('data-item'))

        utils.EventUtil.on('event.tipoUnidade.list.atualizarListaAfterEdit', (data) => { this.updateRowEdit(data) })

        new this._tipoUnidadeView(data, {eventType: 'edit-lista'})

    }


    renderTela() {

        try {


            utils.UnderscoreUtil._template('#template-cadastro-tipo-unidade', {}, '#inner-content', { isLoader: true })

            utils.UnderscoreUtil._template('#template-children-tipo-unidade', {}, '#inner-content-children')

            utils.UnderscoreUtil._template('#template-children-cadastro-list-tipos-unidades', {}, '#inner-content-children-tipo-unidade')

        } catch (err) {
            utils.MessageUtil.error(err)
        }
    }

    renderFormPesquisa() {
        new this._formPesquisaView()

        utils.EventUtil.on('event.tipoUnidade.form.atualizarListaAfterEdit', (data) => { this.updateRowEdit(data) })
        
    }


    render() {
        try {

            utils.HtmlUtil.loader()

            this.renderTela()

            this.carregarTiposUnidades()


            this.renderFormPesquisa()



        } catch (err) {
            utils.MessageUtil.message(err, 'danger')
        }
        return this
    }


}