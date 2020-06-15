const utils = require('../../../../../../helpers/utils-admin')

module.exports = class FinanceiroChequeListView extends Backbone.View {

    constructor() {

        super()

        this.$el = $('body')


        this._block = {
            list: '#block-list-financeiro-cheque'
        }

        this.overrideEvents()

        this._formPesqObj = null




        process.nextTick(() => {
            this._model = new (require('../../../models/cheque'))()
            this._chequeView = require('./cheque-view')
            this._formPesquisaView = require('./cheque-form-pesquisa-view')
            this._movimentacaoChequeView = require('./cheque-movimentacao-view')
            this.render()
        })
    }


    reset() {
        this.$el.off('click', `${this._block.list} #btn-novo-cadastro`)
        this.$el.off('click', `${this._block.list} .btn-editar-cadastro`)
        this.$el.off('click', `${this._block.list} .carregar-mais`)
        this.$el.off('click', `${this._block.list} .pesquisar`)
        this.$el.off('click', `${this._block.list} .limpar-pesquisa`)
    }

    overrideEvents() {

        this.reset()

        this.delegateEvents({
            [`click ${this._block.list} #btn-novo-cadastro`]: 'renderCadastro',
            [`click ${this._block.list} .btn-editar-cadastro`]: 'edit',
            [`click ${this._block.list} .carregar-mais`]: 'carregarMaisItensCadastro',
            [`click ${this._block.list} .pesquisar`]: 'pesquisarClientes',
            [`click ${this._block.list} .limpar-pesquisa`]: 'limparPesquisaCliente'
        })
    }

    edit(e) {
        e.preventDefault()

        let data = utils.JsonUtil.toParse($(e.currentTarget).closest('.row-item-list').attr('data-item'))

        window.location.hash = "#financeiro/cadastro-de-agencias/edicao-cadastro"

        new this._chequeView(data)
    }

    carregarMaisItensCadastro(e) {
        e.preventDefault()

        $(`${this._block.list} .carregar-mais`).attr({ 'disabled': true })

        utils.EventUtil.emit('event.financeiro.agencia.carregarAgenciaByFormPesquisa', { form: this._formPesqObj.getFormPesquisaCache(), append: true })
    }

    carregarData(options = {}) {

        let form = options.form || {}

        let overlay = $(`${this._block.list} #overlay-painel-list-cadastro`).find('.overlay')

        overlay.show()

        this._model.listAll(form).then((r) => {

            this.renderData(r, options)

            overlay.hide()

        }).catch((err) => {
            utils.MessageUtil.error(err)
        })
    }

    renderData(data = {}, options = {}) {

        _.assign(options, { isDesktopMobile: true, closeLoader: true })

        utils.UnderscoreUtil._template('#template-list-table-financeiro-cheques-cadastrados', { cheques: data }, '#inner-financeiro-cheques-cadastrados', options)

        if (data.length > 0){
            $(`${this._block.list} .carregar-mais`).attr({ 'disabled': false })


            new this._movimentacaoChequeView.FinanceiroChequeMovimentacaoListView()

        }
        

    }


    callFormPesquisa() {

        utils.EventUtil.on('event.financeiro.cheque.carregarChequeByFormPesquisa', (param) => {

            this._model.paginatorReset()

            this.carregarData(param)
        })

        this._formPesqObj = new this._formPesquisaView()


        utils.EventUtil.emit('event.financeiro.cheque.carregarChequeByFormPesquisa', { form: this._formPesqObj.getFormPesquisaCache() })

    }

    async renderTela() {

        try {

            await utils.UnderscoreUtil._template('#template-financeiro-cadastro-cheque', {}, '#inner-content', { isLoader: true })

            await utils.UnderscoreUtil._template('#template-children-financeiro-cheque', {}, '#inner-content-children')

            await utils.UnderscoreUtil._template('#template-children-cadastro-list-financeiro-cheque', { form: {} }, '#inner-content-children-financeiro-cheque')


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
