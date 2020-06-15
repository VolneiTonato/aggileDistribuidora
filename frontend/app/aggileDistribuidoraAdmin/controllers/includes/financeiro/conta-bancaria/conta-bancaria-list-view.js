const utils = require('../../../../../../helpers/utils-admin')

class FinanceiroContaBancariaListView extends Backbone.View {

    constructor(){
        super()

        this.$el = $('body')

        this.overrideEvents()

        this._formPesqObject = undefined

        process.nextTick(() => {
            this._model = new (require('../../../models/conta-bancaria'))(),
            this._contaBancariaView = require('./conta-bancaria-view'),
            this._formPesquisaView = require('./conta-bancaria-form-pesquisa-view'),
            this.render()
        })
    }


    reset() {
        this.$el.off('click', '#block-list-financeiro-conta-bancaria #btn-novo-cadastro')
        this.$el.off('click', '#block-list-financeiro-conta-bancaria .btn-editar-cadastro')
        this.$el.off('click', '#block-list-financeiro-conta-bancaria .carregar-mais')
        this.$el.off('click', '#block-list-financeiro-conta-bancaria .pesquisar')
        this.$el.off('click', '#block-list-financeiro-conta-bancaria .limpar-pesquisa')
    }

    overrideEvents() {
        this.reset()


        this.delegateEvents({
            "click #block-list-financeiro-conta-bancaria #btn-novo-cadastro": "renderCadastro",
            "click #block-list-financeiro-conta-bancaria .btn-editar-cadastro": "edit",
            'click #block-list-financeiro-conta-bancaria .carregar-mais': 'carregarMaisItensCadastro',
            'click #block-list-financeiro-conta-bancaria .pesquisar': 'pesquisarClientes',
            'click #block-list-financeiro-conta-bancaria .limpar-pesquisa': 'limparPesquisaCliente',
        })
    }

    edit(e) {
        e.preventDefault()

        let data = utils.JsonUtil.toParse($(e.currentTarget).closest('.row-item-list').attr('data-item'))

        window.location.hash = "#financeiro/cadastro-de-contas-bancarias/edicao-cadastro"

        new this._contaBancariaView(data)
    }

    carregarMaisItensCadastro(e){
        e.preventDefault()

        $('#block-list-financeiro-conta-bancaria .carregar-mais').attr({'disabled': true})

        utils.EventUtil.emit('event.financeiro.contaBancaria.carregarContaBancariaByFormPesquisa', {form : this._formPesqObject.getFormPesquisaCache(), append: true} )
    }

    carregarContasBancarias(options = {}) {

        let form = options.form || {}


        let overlay = $(`#block-list-financeiro-conta-bancaria #overlay-painel-list-cadastro`).find('.overlay')

        overlay.show()

        this._model.listAll(form).then((r) => {

            this.renderContasBancarias(r, options)

            overlay.hide()


        }).catch((err) => {
            utils.MessageUtil.error(err)
        })
    }

    renderContasBancarias(data = {}, options = {}) {

        _.assign(options, { isDesktopMobile: true, closeLoader : true})

        utils.UnderscoreUtil._template('#template-list-table-financeiro-conta-bancaria-cadastrados', { agencias: data }, '#inner-financeiro-conta-bancaria-cadastrados', options)

        if(data.length > 0)
            $('#block-list-financeiro-conta-bancaria .carregar-mais').attr({'disabled': false})


        
    }


    callFormPesquisa(){

        utils.EventUtil.on('event.financeiro.contaBancaria.carregarContaBancariaByFormPesquisa', (param) => {

            this._model.paginatorReset()

            this.carregarContasBancarias(param)
        })

        this._formPesqObject = new this._formPesquisaView()


        utils.EventUtil.emit('event.financeiro.contaBancaria.carregarContaBancariaByFormPesquisa', {form : this._formPesqObject.getFormPesquisaCache()})

    }

    async renderTela() {

        try {

            await utils.UnderscoreUtil._template('#template-financeiro-cadastro-conta-bancaria', {}, '#inner-content', {isLoader : true})

            await utils.UnderscoreUtil._template('#template-children-financeiro-conta-bancaria', {}, '#inner-content-children')

            await utils.UnderscoreUtil._template('#template-children-cadastro-list-financeiro-conta-bancaria', {form : {}}, '#inner-content-children-financeiro-conta-bancaria')


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

module.exports = FinanceiroContaBancariaListView
