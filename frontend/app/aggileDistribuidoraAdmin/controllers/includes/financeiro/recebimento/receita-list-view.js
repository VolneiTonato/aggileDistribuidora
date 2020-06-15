const utils = require('../../../../../../helpers/utils-admin')

module.exports = class FinanceiroContaReceberListView extends Backbone.View {

    constructor() {
        super()

        this._bread = new utils.BreadCrumb()

        this.breadCrumbs()

        this._pathUrl = Backbone.history.getFragment()

        this.$el = $('body')


        this.overrideEvents()


        process.nextTick(() => {
            this._model = new (require('../../../models/receita'))(),
                this._contaReceberView = require('./receita-view'),
                this._formPesquisaView = require('./receita-form-pesquisa-view'),
                this.render()
        })

    }

    breadCrumbs() {
        this._bread.add('inicio', '#home')
            .add('Contas a receber', '#financeiro/contas-a-receber/pesquisa')
    }

    reset() {
        this.$el.off('click', '#block-list-financeiro-receita .btn-visualizar-receita')
        this.$el.off('click', '#block-list-financeiro-receita .btn-cancelar-receita')
        this.$el.off('click', '#block-list-financeiro-receita .carregar-mais')
        this.$el.off('click', '#block-list-financeiro-receita .btn-pagar-total-receita')
    }


    overrideEvents() {
        this.reset()


        this.delegateEvents({
            "click #block-list-financeiro-receita .btn-visualizar-receita": "visualizarReceitaDetalhada",
            'click #block-list-financeiro-receita .btn-cancelar-receita': 'cancelarReceita',
            'click #block-list-financeiro-receita .carregar-mais': 'carregarMaisItensCadastro',
            'click #block-list-financeiro-receita .btn-pagar-total-receita': 'pagamentoTotalReceita'
        })

    }

    pagamentoTotalReceita(e) {
        e.preventDefault()

        let data = utils.JsonUtil.toParse($(e.currentTarget).closest('.row-item-list').attr('data-item'))

        let run = () => {
            this._model.recebimentoTotal(data.id)
                .then((ok) => {
                    utils.MessageUtil.alert('Conta paga com sucesso', 'success')
                    $(e.currentTarget).closest('.row-item-list').remove()
                }).catch((err) => { utils.MessageUtil.error(err) })
        }


        let options = {
            buttons: {
                'Sim': (e) => {
                    run()
                    utils.MessageUtil.closeButton(e)
                },
                'Fechar': (e) => {
                    utils.MessageUtil.closeButton(e)
                }
            }
        }



        utils.MessageUtil.message('Deseja fazer o pagamento total desta fatura?',
            'info',
            options)

    }

    cancelarReceita(e) {
        e.preventDefault()

        let data = utils.JsonUtil.toParse($(e.currentTarget).closest('.row-item-list').attr('data-item'))

        if (data.status != 'aberta')
            return utils.MessageUtil.message('Não é possível cancelar este recebimento!', 'warning')


        let run = () => {

            this._model.cancelarReceita(data).then((r) => {
                this.render()
            }).catch((err) => {
                utils.MessageUtil.error(err)
            })
        }


        let options = {
            buttons: {
                'Sim': (e) => {
                    run()
                    utils.MessageUtil.closeButton(e)
                },
                'Fechar': (e) => {
                    utils.MessageUtil.closeButton(e)
                }
            }
        }



        utils.MessageUtil.message('Deseja realmente cancelar este lançamento de recebimento?',
            'success',
            options)

    }



    visualizarReceitaDetalhada(e) {
        e.preventDefault()

        let data = utils.JsonUtil.toParse($(e.currentTarget).closest('.row-item-list').attr('data-item'))

        window.location.hash = "#financeiro/contas-a-receber/lancamento"

        new this._contaReceberView(data)
    }



    pesquisarReceitas(e) {
        e.preventDefault()

        let form = utils.FormUtil.mapObject('#block-list-financeiro-receita #form-pesquisa')

        utils.localStorageUtil.setStorage('ultima_pesquisa_receitas_cadastro', form.formObject.pesquisa)

        paginator = utils.PaginatorUtil.paginator()


        this.carregarListaReceitas()

    }

    callFormPesquisa() {



        utils.EventUtil.on('event.financeiro.receita.carregarReceitaByFormPesquisa', (param) => {

            this._model.paginatorReset()

            this.carregarListaReceitas(param)
        })

        this._formPesqObj = new this._formPesquisaView()


        utils.EventUtil.emit('event.financeiro.receita.carregarReceitaByFormPesquisa', {form: this._formPesqObj.getFormPesquisaCache()})

    }


    carregarMaisItensCadastro(e) {
        e.preventDefault()

        $('#block-list-financeiro-receita .carregar-mais').attr({ 'disabled': true })


        this.carregarListaReceitas({ form: this._formPesqObj.getFormPesquisaCache(), append: true })
    }


    carregarListaReceitas(options = {}) {

        let form = options.form || {}

        let overlay = $(`#block-list-financeiro-receita #overlay-painel-list-cadastro`).find('.overlay')

        overlay.show()

        if (Object.getOwnPropertyNames(form).length == 0)
            form = { status: 'pendente' }




        this._model.findAllReceitas(form)
            .then((r) => {


                this.renderReceitas(r, options)

            }).catch((err) => {

                utils.MessageUtil.error(err)

            }).finally(() => {



                overlay.hide()
            })




    }


    renderTela() {

        try {

            //this.breadCrumbs()

            utils.HtmlUtil.loader()


            //Template layout.pug
            utils.UnderscoreUtil._template('#template-financeiro-receita', {}, '#inner-content')

            //template receita.pug
            utils.UnderscoreUtil._template('#template-children-financeiro-receita', {}, '#inner-content-children')

            //template receitas
            utils.UnderscoreUtil._template('#template-children-financeiro-receita-list', {}, '#inner-content-children-financeiro-receita')

            utils.UnderscoreUtil._template('#template-list-receitas-lancadas-parent', {}, '#inner-receitas-lancadas-parent')

            this.callFormPesquisa()

        } catch (err) {
            utils.MessageUtil.error(err)
        }
    }

    renderReceitas(data = {}, options = {}) {



        _.assign(options, { isDesktopMobile: true, closeLoader: true })

        utils.UnderscoreUtil._template('#template-list-receitas-lancadas', { recebimentos: data }, '#inner-receitas-lancadas', options)

        if (data.length > 0)
            $('#block-list-financeiro-receita .carregar-mais').attr({ 'disabled': false })

        $('#block-list-financeiro-receita').find('#inner-receitas-lancadas-desktop, #inner-receitas-lancadas-mobile').find('.status-print').each((i, item) => {

            let block = $(item).closest('.row-item-list')

            let status = $(item).text()


            if (['cancelada', 'paga'].indexOf(status) !== -1)
                $(block).find('.btn-cancelar-receita').hide()

            if (['aberta'].indexOf(status) !== -1)
                $(block).find('.btn-pagar-total-receita').show()
            else
                $(block).find('.btn-pagar-total-receita').hide()

        })
    }



    render() {
        try {

            utils.HtmlUtil.loader()

            this._bread.show()

            this.renderTela()

        } catch (err) {
            utils.MessageUtil.message(err, 'danger')
        }
        return this
    }

}
