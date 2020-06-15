const utils = require('../../../../../../helpers/utils-admin')

module.exports = class FinanceiroContaPagarListView extends Backbone.View {

    constructor() {
        super()

        this._bread = new utils.BreadCrumb()

        this.breadCrumbs()

        this._pathUrl = Backbone.history.getFragment()

        this.$el = $('body')


        this.overrideEvents()


        process.nextTick(() => {
            this._model = new (require('../../../models/despesa'))(),
            this._contaPagarView = require('./despesa-view'),
            this._formPesquisaView = require('./despesa-form-pesquisa-view'),
            this.render()
        })
        
    }

    breadCrumbs() {
        this._bread.add('inicio', '#home')
            .add('Contas a pagar', '#financeiro/contas-a-pagar/pesquisa')
    }

    reset() {
        this.$el.off('click', '#block-list-financeiro-despesa .btn-visualizar-despesa')
        this.$el.off('click', '#block-list-financeiro-despesa .btn-cancelar-despesa')
        this.$el.off('click', '#block-list-financeiro-despesa .carregar-mais')
        this.$el.off('click', '#block-list-financeiro-despesa .btn-pagar-total-despesa')
    }


    overrideEvents() {
        this.reset()


        this.delegateEvents({
            "click #block-list-financeiro-despesa .btn-visualizar-despesa": "visualizarDespesaDetalhada",
            'click #block-list-financeiro-despesa .btn-cancelar-despesa': 'cancelarDespesa',
            'click #block-list-financeiro-despesa .carregar-mais': 'carregarMaisItensCadastro',
            'click #block-list-financeiro-despesa .btn-pagar-total-despesa': 'pagamentoTotalDespesa'
        })

    }

    pagamentoTotalDespesa(e) {
        e.preventDefault()

        let data = utils.JsonUtil.toParse($(e.currentTarget).closest('.row-item-list').attr('data-item'))

        //if (utils.NumberUtil.cdbl(data.valor) === utils.NumberUtil.cdbl(data.saldo) && utils.NumberUtil.cdbl(data.saldo) > 0 && data.status === 'aberta') {

            let run = () => {
                this._model.pagamentoTotal(data)
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


        //} else {
        //    return utils.MessageUtil.alert('Esta conta já possui um lançamento de pagamento. Favor detalhar a conta e fazer o pagamento!', 'warning')
        //}

    }

    cancelarDespesa(e) {
        e.preventDefault()

        let data = utils.JsonUtil.toParse($(e.currentTarget).closest('.row-item-list').attr('data-item'))

        if (data.status != 'aberta')
            return utils.MessageUtil.message('Não é possível cancelar esta despesa!', 'warning')


        let run = () => {

            this._model.cancelarDespesa(data).then((r) => {
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



        utils.MessageUtil.message('Deseja realmente cancelar este lançamento de Despesa?',
            'success',
            options)

    }


    visualizarDespesaDetalhada(e) {
        e.preventDefault()

        let data = utils.JsonUtil.toParse($(e.currentTarget).closest('.row-item-list').attr('data-item'))

        window.location.hash = "#financeiro/contas-a-pagar/lancamento"

        new this._contaPagarView(data)

    }



    pesquisarDespesas(e) {
        e.preventDefault()

        let form = utils.FormUtil.mapObject('#block-list-financeiro-despesa #form-pesquisa')

        utils.localStorageUtil.setStorage('ultima_pesquisa_despesas_cadastro', form.formObject.pesquisa)

        paginator = utils.PaginatorUtil.paginator()


        this.carregarListaDespesas()

    }

    callFormPesquisa(){

        

        utils.EventUtil.on('event.financeiro.despesa.carregarDespesaByFormPesquisa', (param) => {

            this._model.paginatorReset()

            this.carregarListaDespesas(param)
        })

        this._formPesqObj = new this._formPesquisaView()


        utils.EventUtil.emit('event.financeiro.despesa.carregarDespesaByFormPesquisa', {form: this._formPesqObj.getFormPesquisaCache()} )

    }


    carregarMaisItensCadastro(e) {
        e.preventDefault()

        $('#block-list-financeiro-despesa .carregar-mais').attr({ 'disabled': true })


        this.carregarListaDespesas({form: this._formPesqObj.getFormPesquisaCache(), append: true })
    }


    carregarListaDespesas(options = {}) {

        let form = options.form || {}

        let overlay = $(`#block-list-financeiro-despesa #overlay-painel-list-cadastro`).find('.overlay')

        overlay.show()

        if (Object.getOwnPropertyNames(form).length == 0)
            form = { status: 'pendente' }




        this._model.findAllDespesas(form)
            .then((r) => {


                this.renderDespesas(r, options)

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
            utils.UnderscoreUtil._template('#template-financeiro-despesa', {}, '#inner-content')

            //template receita.pug
            utils.UnderscoreUtil._template('#template-children-financeiro-despesa', {}, '#inner-content-children')

            //template receitas
            utils.UnderscoreUtil._template('#template-children-financeiro-despesa-list', {}, '#inner-content-children-financeiro-despesa')

            utils.UnderscoreUtil._template('#template-list-despesa-lancadas-parent', {}, '#inner-despesa-lancadas-parent')

            this.callFormPesquisa()
            
        } catch (err) {
            utils.MessageUtil.error(err)
        }
    }

    renderDespesas(data = {}, options = {}) {



        _.assign(options, { isDesktopMobile: true, closeLoader: true })

        utils.UnderscoreUtil._template('#template-list-despesa-lancadas', { recebimentos: data }, '#inner-despesa-lancadas', options)

        if (data.length > 0)
            $('#block-list-financeiro-despesa .carregar-mais').attr({ 'disabled': false })


        $('#block-list-financeiro-despesa').find('#inner-despesa-lancadas-desktop, #inner-despesa-lancadas-mobile').find('.status-print').each((i, item) => {

            let block = $(item).closest('.row-item-list')

            let status = $(item).text()


            if (['cancelada', 'paga'].indexOf(status) !== -1)
                $(block).find('.btn-cancelar-despesa').hide()

            if(['aberta'].indexOf(status) !== -1)
                $(block).find('.btn-pagar-total-despesa').show()
            else
                $(block).find('.btn-pagar-total-despesa').hide()

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
