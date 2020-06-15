let utils = require('../../../../../../helpers/utils-admin')

class FinanceiroBancoListView extends Backbone.View {

    constructor() {
        super()


        this._bread = new utils.BreadCrumb()

        this.breadCrumbs()

        this._pathUrl = Backbone.history.getFragment()

        this.$el = $('body')

        this.overrideEvents()

        process.nextTick(() => {
            this._model = new (require('../../../models/banco'))(),
                this._bancoView = require('./banco-view'),
                this._formPesquisaView = require('./banco-form-pesquisa-view'),
                this.render()
        })


    }

    breadCrumbs() {
        this._bread.add('inicio', '#home')
            .add('Volumes', '#cadastro-de-volumes')
    }

    reset() {
        this.$el.off('click', '#block-list-financeiro-banco #btn-novo-cadastro')
        this.$el.off('click', '#block-list-financeiro-banco .btn-editar-cadastro')
        this.$el.off('click', '#block-list-financeiro-banco .carregar-mais')
    }


    overrideEvents() {
        this.reset()


        this.delegateEvents({
            "click #block-list-financeiro-banco #btn-novo-cadastro": "novoCadastro",
            "click #block-list-financeiro-banco .btn-editar-cadastro": "edit",
            'click #block-list-financeiro-banco .carregar-mais': 'carregarMaisItensCadastro'

        })


    }

    novoCadastro(e) {
        e.preventDefault()

        new this._bancoView()
    }



    carregarMaisItensCadastro(e) {
        e.preventDefault()

        $('#block-list-financeiro-banco .carregar-mais').attr({ 'disabled': true })

        this.carregarBancos({ append: true })
    }

    carregarBancos(options = {}) {

        let overlay = $(`#block-list-financeiro-banco #overlay-painel-list-cadastro`).find('.overlay')

        overlay.show()


        this._model.listAll().then((r) => {

            this.renderBancos(r, options)

            overlay.hide()


        }).catch((err) => {
            utils.MessageUtil.error(err)
        })
    }

    async renderBancos(data = {}, options = {}) {

        _.assign(options, { isDesktopMobile: true, closeLoader: true })

        await utils.UnderscoreUtil._template('#template-list-table-financeiro-bancos-cadastrados', { bancos: data }, '#inner-financeiro-bancos-cadastrados', options)

        if (data.length > 0)
            $('#block-list-financeiro-banco .carregar-mais').attr({ 'disabled': false })

        new utils.TableUtil('#block-list-financeiro-banco')
    }

    updateRowEdit(data) {

        let rowDesktop = $('#block-list-financeiro-banco #inner-financeiro-bancos-cadastrados-desktop').find(`[data-key=${data.id}]`).attr('data-key', data.id)

        let rowMobile = $('#block-list-financeiro-banco #inner-financeiro-bancos-cadastrados-mobile').find(`[data-key=${data.id}]`).attr('data-key', data.id)

        if (rowDesktop && rowMobile) {


            let serialize = utils.JsonUtil.toString(data)

            $(rowDesktop).find('td:eq(0)').text(data.codigo)
            $(rowDesktop).find('td:eq(1)').text(data.descricao)
            $(rowDesktop).attr('data-item', serialize)

            $(rowMobile).find('.mb-1:eq(0) > span').text(data.codigo)
            $(rowMobile).find('.mb-1:eq(1) > span').text(`${data.descricao}`)
            $(rowMobile).attr('data-item', serialize)
        }
    }

    edit(e) {
        e.preventDefault()

        let data = utils.JsonUtil.toParse($(e.currentTarget).closest('.row-item-list').attr('data-item'))

        utils.EventUtil.on('event.financeiro.list.atualizarListaAfterEdit', (data) => { this.updateRowEdit(data) })

        new this._bancoView(data, {eventType: 'edit-lista'})

    }


    renderTela() {

        try {


            utils.UnderscoreUtil._template('#template-financeiro-cadastro-banco', {}, '#inner-content', { isLoader: true })

            utils.UnderscoreUtil._template('#template-children-financeiro-banco', {}, '#inner-content-children')

            utils.UnderscoreUtil._template('#template-children-cadastro-list-financeiro-bancos', {}, '#inner-content-children-financeiro-banco')

        } catch (err) {
            utils.MessageUtil.error(err)
        }
    }

    renderFormPesquisa() {
        new this._formPesquisaView()

        utils.EventUtil.on('event.financeiro.form.atualizarListaAfterEdit', (data) => { this.updateRowEdit(data) })
        
    }


    render() {
        try {

            utils.HtmlUtil.loader()

            this.renderTela()

            this.carregarBancos()


            this.renderFormPesquisa()



        } catch (err) {
            utils.MessageUtil.message(err, 'danger')
        }
        return this
    }


}


module.exports = FinanceiroBancoListView