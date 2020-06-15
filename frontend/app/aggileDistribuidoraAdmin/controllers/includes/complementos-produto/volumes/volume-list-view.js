let utils = require('../../../../../../helpers/utils-admin')

module.exports = class VolumeListView extends Backbone.View {

    constructor() {
        super()


        this._bread = new utils.BreadCrumb()

        this.breadCrumbs()

        this._pathUrl = Backbone.history.getFragment()

        this.$el = $('body')

        this.overrideEvents()

        process.nextTick(() => {
            this._model = new (require('../../../models/volume'))()
            this._volumeView = require('./volume-view')
            this._formPesquisaView = require('./volume-form-pesquisa-view')
            this.render()
        })


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
            "click #block-list-volume #btn-novo-cadastro": "novoCadastro",
            "click #block-list-volume .btn-editar-cadastro": "edit",
            'click #block-list-volume .carregar-mais': 'carregarMaisItensCadastro'

        })


    }

    novoCadastro(e) {
        e.preventDefault()

        new this._volumeView()
    }



    carregarMaisItensCadastro(e) {
        e.preventDefault()

        $('#block-list-volume .carregar-mais').attr({ 'disabled': true })

        this.carregarVolumes({ append: true })
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

    async renderVolumes(data = {}, options = {}) {

        _.assign(options, { isDesktopMobile: true, closeLoader: true })

        await utils.UnderscoreUtil._template('#template-list-table-volumes-cadastrados', { volumes: data }, '#inner-volumes-cadastrados', options)

        if (data.length > 0)
            $('#block-list-volume .carregar-mais').attr({ 'disabled': false })

        new utils.TableUtil('#block-list-volume')
    }

    updateRowEdit(data) {


        console.log(data)

        let rowDesktop = $('#block-list-volume #inner-volumes-cadastrados-desktop').find(`[data-key=${data.id}]`).attr('data-key', data.id)

        let rowMobile = $('#block-list-volume #inner-volumes-cadastrados-mobile').find(`[data-key=${data.id}]`).attr('data-key', data.id)

        if (rowDesktop && rowMobile) {


            let serialize = utils.JsonUtil.toString(data)

            //$(rowDesktop).find('td:eq(0)').text(data.codigo)
            $(rowDesktop).find('td:eq(0)').text(data.descricao)
            $(rowDesktop).attr('data-item', serialize)

            //$(rowMobile).find('.mb-1:eq(0) > span').text(data.codigo)
            $(rowMobile).find('.mb-1:eq(0) > span').text(`${data.descricao}`)
            $(rowMobile).attr('data-item', serialize)
        }
    }

    edit(e) {
        e.preventDefault()

        let data = utils.JsonUtil.toParse($(e.currentTarget).closest('.row-item-list').attr('data-item'))

        utils.EventUtil.on('event.volume.list.atualizarListaAfterEdit', (data) => { this.updateRowEdit(data) })

        new this._volumeView(data, {eventType: 'edit-lista'})

    }


    renderTela() {

        try {


            utils.UnderscoreUtil._template('#template-cadastro-volume', {}, '#inner-content', { isLoader: true })

            utils.UnderscoreUtil._template('#template-children-volume', {}, '#inner-content-children')

            utils.UnderscoreUtil._template('#template-children-cadastro-list-volumes', {}, '#inner-content-children-volume')

        } catch (err) {
            utils.MessageUtil.error(err)
        }
    }

    renderFormPesquisa() {
        new this._formPesquisaView()

        utils.EventUtil.on('event.volume.form.atualizarListaAfterEdit', (data) => { this.updateRowEdit(data) })
        
    }


    render() {
        try {

            utils.HtmlUtil.loader()

            this.renderTela()

            this.carregarVolumes()


            this.renderFormPesquisa()



        } catch (err) {
            utils.MessageUtil.message(err, 'danger')
        }
        return this
    }


}