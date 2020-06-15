const utils = require('../../../../../../helpers/utils-admin')

class FinanceiroAgenciaListView extends Backbone.View {

    constructor(){
        super()

        this.$el = $('body')

        this.overrideEvents()

        this._formPesqObj = null


        process.nextTick(() => {
            this._model = new (require('../../../models/agencia'))(),
            this._agenciaView = require('./agencia-view'),
            this._formPesquisaView = require('./agencia-form-pesquisa-view'),
            this.render()
        })
    }


    reset() {
        this.$el.off('click', '#block-list-financeiro-agencia #btn-novo-cadastro')
        this.$el.off('click', '#block-list-financeiro-agencia .btn-editar-cadastro')
        this.$el.off('click', '#block-list-financeiro-agencia .carregar-mais')
        this.$el.off('click', '#block-list-financeiro-agencia .pesquisar')
        this.$el.off('click', '#block-list-financeiro-agencia .limpar-pesquisa')
    }

    overrideEvents() {
        this.reset()


        this.delegateEvents({
            "click #block-list-financeiro-agencia #btn-novo-cadastro": "renderCadastro",
            "click #block-list-financeiro-agencia .btn-editar-cadastro": "edit",
            'click #block-list-financeiro-agencia .carregar-mais': 'carregarMaisItensCadastro',
            'click #block-list-financeiro-agencia .pesquisar': 'pesquisarClientes',
            'click #block-list-financeiro-agencia .limpar-pesquisa': 'limparPesquisaCliente',
        })
    }

    edit(e) {
        e.preventDefault()

        let data = utils.JsonUtil.toParse($(e.currentTarget).closest('.row-item-list').attr('data-item'))

        window.location.hash = "#financeiro/cadastro-de-agencias/edicao-cadastro"

        new this._agenciaView(data)
    }

    carregarMaisItensCadastro(e){
        e.preventDefault()

        $('#block-list-financeiro-agencia .carregar-mais').attr({'disabled': true})

        utils.EventUtil.emit('event.financeiro.agencia.carregarAgenciaByFormPesquisa', {form: this._formPesqObj.getFormPesquisaCache(), append: true})
    }

    carregarAgencias(options = {}) {

        let form = options.form || {}

        let overlay = $(`#block-list-financeiro-agencia #overlay-painel-list-cadastro`).find('.overlay')

        overlay.show()

        this._model.listAll(form).then((r) => {            

            this.renderAgencias(r, options)

            overlay.hide()

        }).catch((err) => {
            utils.MessageUtil.error(err)
        })
    }

    renderAgencias(data = {}, options = {}) {

        _.assign(options, { isDesktopMobile: true, closeLoader : true})

        utils.UnderscoreUtil._template('#template-list-table-financeiro-agencias-cadastrados', { agencias: data }, '#inner-financeiro-agencias-cadastrados', options)

        if(data.length > 0)
            $('#block-list-financeiro-agencia .carregar-mais').attr({'disabled': false})


        
    }


    callFormPesquisa(){

        utils.EventUtil.on('event.financeiro.agencia.carregarAgenciaByFormPesquisa', (param) => {

            this._model.paginatorReset()

            this.carregarAgencias(param)
        })

        this._formPesqObj = new this._formPesquisaView()


        utils.EventUtil.emit('event.financeiro.agencia.carregarAgenciaByFormPesquisa', {form :  this._formPesqObj.getFormPesquisaCache()} )

    }

    async renderTela() {

        try {

            await utils.UnderscoreUtil._template('#template-financeiro-cadastro-agencia', {}, '#inner-content', {isLoader : true})

            await utils.UnderscoreUtil._template('#template-children-financeiro-agencia', {}, '#inner-content-children')

            await utils.UnderscoreUtil._template('#template-children-cadastro-list-financeiro-agencia', {form : {}}, '#inner-content-children-financeiro-agencia')

            


            this.callFormPesquisa()

        } catch (err) {
            utils.MessageUtil.error(err)
        }
    }


    render() {
        try {

            utils.HtmlUtil.loader()

            this.renderTela()
           

        } catch (err) {
            utils.MessageUtil.message(err, 'danger')
        }
        return this
    }

}

module.exports = FinanceiroAgenciaListView
