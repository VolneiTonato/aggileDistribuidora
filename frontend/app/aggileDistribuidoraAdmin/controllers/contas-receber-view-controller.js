let utils = require('../../../helpers/utils-admin')
let _ = require('lodash')

let cache = {
    conta: {}
}


let paginator = utils.PaginatorUtil.paginator()


class ContaReceberModel extends utils.BackboneModelUtil {

    constructor() {
        super()
    }

    defaults() {

    }


    model(form) {
        return utils.FormUtil.mapObject(form)
    }

    async save(data, isForm = true) {
        this.url = utils.UrlUtil.url(`admin/financeiro/contas-a-receber/save`)

        let send = { data: isForm ? this.model(data).formObject : data, type: 'POST' }

        return await this.fetch(send)
    }


    async conta(id) {



        this.url = utils.UrlUtil.url(`admin/financeiro/contas-a-receber/obter-conta`)

        let send = { data: { id: id }, type: 'POST' }

        return await this.fetch(send)
    }

    async recebimentoTotal(data) {

        this.url = utils.UrlUtil.url(`admin/financeiro/contas-a-receber/recebimento-total`)

        let send = { data: data, type: 'POST' }

        return await this.fetch(send)
    }


    async recebimento(data) {

        this.url = utils.UrlUtil.url(`admin/financeiro/contas-a-receber/recebimento`)

        let send = { data: data, type: 'POST' }

        return await this.fetch(send)
    }

    async listAllHistoricos(recebimentoId) {
        this.url = utils.UrlUtil.url(`admin/financeiro/contas-a-receber/list-historicos-by-recebimento`)

        let send = { data: { recebimentoId: recebimentoId }, type: 'GET' }

        return await this.fetch(send)
    }

    async saveHistorico(data) {
        this.url = utils.UrlUtil.url(`admin/financeiro/contas-a-receber/save-historico`)

        let send = { data: data, type: 'POST' }

        return await this.fetch(send)
    }

    async saveHistoricoParcelas(data) {
        this.url = utils.UrlUtil.url(`admin/financeiro/contas-a-receber/save-historico-parcela`)

        let send = { data: data, type: 'POST' }

        return await this.fetch(send)
    }

    async cancelarReceita(data) {
        this.url = utils.UrlUtil.url(`admin/financeiro/contas-a-receber/cancelar-receita`)

        let send = { data: data, type: 'POST' }

        return await this.fetch(send)
    }

    async findAllReceitas(data) {

        _.assign(data, paginator)

        this.url = utils.UrlUtil.url(`admin/financeiro/contas-a-receber/listar-receitas`)

        let send = { type: 'POST', data: data }


        try {
            let retorno = await this.fetch(send)

            if (retorno.length > 0)
                paginator = utils.PaginatorUtil.calcularPaginator(paginator)


            return retorno

        } catch (err) {
            throw err
        }
    }
}

class ContaReceberListView extends Backbone.View {

    constructor() {
        super()

        this._bread = new utils.BreadCrumb()

        this.breadCrumbs()

        paginator = utils.PaginatorUtil.paginator()

        this._pathUrl = Backbone.history.getFragment()


        this._model = new ContaReceberModel()

        this.$el = $('body')

        this.overrideEvents()

        this.render()
    }

    breadCrumbs() {
        this._bread.add('inicio', '#home')
            .add('Contas a receber', '#financeiro/contas-a-receber/pesquisa')
    }

    reset() {
        this.$el.off('click', '#block-list-financeiro-receita .btn-visualizar-receita')
        this.$el.off('click', '#block-list-financeiro-receita .btn-cancelar-receita')
        this.$el.off('click', '#block-list-financeiro-receita .pesquisar')
        this.$el.off('click', '#block-list-financeiro-receita .limpar-pesquisa')
        this.$el.off('click', '#block-list-financeiro-receita .carregar-mais')
        this.$el.off('click', '#block-list-financeiro-receita .btn-pagar-total-receita')
        this.$el.off('change', '#block-list-financeiro-receita #form-pesquisa #pesquisa-tipo-pessoa')
    }


    overrideEvents() {
        this.reset()


        this.delegateEvents({
            "click #block-list-financeiro-receita .btn-visualizar-receita": "visualizarReceitaDetalhada",
            'click #block-list-financeiro-receita .btn-cancelar-receita': 'cancelarReceita',
            'click #block-list-financeiro-receita .pesquisar': 'pesquisarReceitas',
            'click #block-list-financeiro-receita .limpar-pesquisa': 'limparPesquisaPedidos',
            'click #block-list-financeiro-receita .carregar-mais': 'carregarMaisItensCadastro',
            'click #block-list-financeiro-receita .btn-pagar-total-receita': 'pagamentoTotalReceita',
            'change #block-list-financeiro-receita #form-pesquisa #pesquisa-tipo-pessoa': 'changeTipoPessoaAutoCompleteFormPesquisa'
        })

    }

    pagamentoTotalReceita(e) {
        e.preventDefault()

        let data = utils.JsonUtil.toParse($(e.currentTarget).closest('.row-item-list').attr('data-item'))

        if (utils.NumberUtil.cdbl(data.valor) === utils.NumberUtil.cdbl(data.saldo) && utils.NumberUtil.cdbl(data.saldo) > 0 && data.status === 'aberta') {

            let run = () => {
                this._model.recebimentoTotal(data)
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


        } else {
            return utils.MessageUtil.alert('Esta conta já possui um lançamento de pagamento. Favor detalhar a conta e fazer o pagamento!', 'warning')
        }

    }

    limparPesquisaPedidos(e) {
        e.preventDefault()

        utils.localStorageUtil.removeStorage('ultima_pesquisa_receitas_cadastro')

        this.renderFormPesquisa()
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

        new ContaReceberView(data)

    }


    changeTipoPessoaAutoCompleteFormPesquisa(e) {
        let type = $(e.currentTarget).val()

        let form = utils.FormUtil.mapObject('#block-list-financeiro-receita #form-pesquisa')

        if (_.get(form, 'pesquisa')) {
            form.pesquisa.pessoaNome.val('')
            form.pesquisa.pessoaId.val('')
        }



        this.renderAutoCompletePessoaFormPesquisa(type)
    }

    selectTipoPessoaByPessoaFormPesquisa(tipoPessoa) {
        if (!tipoPessoa)
            return false

        let block = $('#block-list-financeiro-receita #form-pesquisa')



        block.find('#pesquisa-tipo-pessoa:radio').filter((i, item) => {
            $(item).attr('checked', false)
            if ($(item).val() == tipoPessoa)
                $(item).attr({ checked: true })
        })
    }

    renderAutoCompletePessoaFormPesquisa(type, data = {}) {

        let form = this.getFormPesquisaCache()

        $('#block-list-financeiro-receita #form-pesquisa #inner-pessoa-autocomplete-pesquisa').html('')

        if (!type)
            return false

        if (form.tipoPessoa != type) {
            form.pessoaNome = ''
            form.pessoaId = ''
        }

        utils.UnderscoreUtil._template('#template-geral-autocomplete-pessoa', { data: { title: type, name: _.get(form, 'pessoaNome') } }, '#inner-pessoa-autocomplete-pesquisa')

        utils.AutoCompleteUtil.AutoComplete({
            type: type,
            bloco: '#block-list-financeiro-receita #form-pesquisa #bloco-autocomplete-pessoa',
            input: 'input[name="pesquisa_pessoaId"]',
            isClearValue: false,
            form: '#block-list-financeiro-receita #form-pesquisa',
            callback: (item) => {

                let name = undefined
                let tipoPessoa = _.get(item, 'data.tipoPessoa')

                switch (tipoPessoa) {
                    case 'cliente':
                    case 'fabrica':
                    case 'cedente':
                        name = _.get(item, `data.${tipoPessoa}.razaoSocial`)
                        break
                    case 'vendedor':
                        name = _.get(item, 'data.vendedor.nome')
                        break
                }

                if (name)
                    $('#block-list-financeiro-despesa #form-pesquisa input[name="pesquisa_pessoaNome"]').val(name)

            }

        })
    }

    getFormPesquisaCache() {
        let form = {}

        if (utils.localStorageUtil.isStorageItem('ultima_pesquisa_receitas_cadastro'))
            form = utils.localStorageUtil.getStorage('ultima_pesquisa_receitas_cadastro')

        return form
    }


    renderFormPesquisa() {

        let form = this.getFormPesquisaCache()


        utils.UnderscoreUtil._template("#template-form-pesquisa-receitas", { form: form }, '#inner-form-pesquisa-receitas')


        $.when(utils.EstadoMunicipioUtil.municipioSelectBox(
            {
                municipioElement: '#block-list-financeiro-receita #pesquisa-municipio',
                municipio: form.municipio
            }
        ))

        this.renderAutoCompletePessoaFormPesquisa()

        let select = $('#block-list-financeiro-receita #form-pesquisa').find('#pesquisa-status')

        utils.ApiUtil.statusRecebimentos().then((status) => {


            select.append(`<option value="">Selecione</option>`)
            select.append(`<option value="all">Todos</option>`)

            status.forEach((item) => {

                select.append(`<option value="${item.value}" ${item.value == form.status ? 'selected' : ''} >${item.text}</option>`)
            })
        })


    }

    pesquisarReceitas(e) {
        e.preventDefault()

        let form = utils.FormUtil.mapObject('#block-list-financeiro-receita #form-pesquisa')

        utils.localStorageUtil.setStorage('ultima_pesquisa_receitas_cadastro', form.formObject.pesquisa)

        paginator = utils.PaginatorUtil.paginator()


        this.carregarListaReceitas()

    }


    carregarMaisItensCadastro(e) {
        e.preventDefault()

        $('#block-list-financeiro-receita .carregar-mais').attr({ 'disabled': true })
        

        this.carregarListaReceitas({ append: true })
    }


    carregarListaReceitas(options) {

        let form = this.getFormPesquisaCache()

        

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

            this.renderFormPesquisa()
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
            this.carregarListaReceitas()

        } catch (err) {
            utils.MessageUtil.message(err, 'danger')
        }
        return this
    }

}



class ContaReceberView extends Backbone.View {
    constructor(conta = {}) {
        super()



        this._bread = new utils.BreadCrumb()

        this.breadCrumbs()



        this._bloco = {
            principal: '#block-form-financeiro-contas-a-receber',
            formHistoricoLancamento: '#form-financeiro-receita-lancamento-historico',
            formCadastro: '#form-cadastro'
        }

        this._pathUrl = Backbone.history.getFragment()


        this._model = new ContaReceberModel()

        this.$el = $('body')

        this.overrideEvents()

        this._hashModal = {
            formParcela: '',
            formCheque: ''
        }



        this.render(conta)
    }

    breadCrumbs() {
        this._bread.add('inicio', '#home')
            .add('Contas a receber', '#financeiro/contas-a-receber/pesquisa')
    }


    reset() {
        this.$el.off('click', '#block-form-financeiro-contas-a-receber .adicionar-historico')
        this.$el.off('click', '#block-form-financeiro-contas-a-receber .editar-historico-lancado')
        this.$el.off('click', '#block-form-financeiro-contas-a-receber #btn-lancar-receita')
        this.$el.off('change', '#block-form-financeiro-contas-a-receber #lancamento-forma-pagamento')
        this.$el.off('click', '#block-form-financeiro-contas-a-receber .pagar-historico-lancado')
        this.$el.off('click', '#block-form-financeiro-contas-a-receber .pagar-historico')
        this.$el.off('click', '#block-form-financeiro-contas-a-receber #btn-novo-cadastro')
        this.$el.off('click', '#block-list-financeiro-receita #btn-novo-cadastro')
        this.$el.off('click', '#block-form-financeiro-contas-a-receber #form-cadastro .btn-lancar-receita-paga')
        this.$el.off('click', '#block-form-financeiro-contas-a-receber .lancar-historico-devedor')
        this.$el.off('click', '#block-form-financeiro-contas-a-receber .cancelar-lancamento-historico')
        this.$el.off('click', '#block-form-financeiro-contas-a-receber .parcelar-lancamento-historico')
        this.$el.off('click', '#form-parcela-receitas .btn-lancar-parcela-historico')
        this.$el.off('change','#block-form-financeiro-contas-a-receber #form-cadastro #tipo-pessoa')
    }


    overrideEvents() {
        this.reset()


        this.delegateEvents({
            "click #block-form-financeiro-contas-a-receber #btn-lancar-receita": "save",
            "click #block-form-financeiro-contas-a-receber .adicionar-historico": "lancarHistorico",
            "click #block-form-financeiro-contas-a-receber .editar-historico-lancado": "editarHistorico",
            "click #block-form-financeiro-contas-a-receber .pagar-historico-lancado": "pagamentoHistorico",
            "click #block-form-financeiro-contas-a-receber .pagar-historico": "pagamento",
            'change #block-form-financeiro-contas-a-receber #lancamento-forma-pagamento': "changeFormaPagamento",
            'click #block-form-financeiro-contas-a-receber #btn-novo-cadastro': 'novoCadastro',
            'click #block-list-financeiro-receita #btn-novo-cadastro': 'renderCadastro',
            'click #block-form-financeiro-contas-a-receber #form-cadastro .btn-lancar-receita-paga': 'lancarReceitaComoPaga',
            'click #block-form-financeiro-contas-a-receber .lancar-historico-devedor': 'lancarReceitaDevedor',
            'click #block-form-financeiro-contas-a-receber .cancelar-lancamento-historico': 'fecharFormularioLancamentoHistorico',
            'click #block-form-financeiro-contas-a-receber .parcelar-lancamento-historico': 'formParcelaHistorico',
            'click #form-parcela-receitas .btn-lancar-parcela-historico': 'parcelar',
            'change #block-form-financeiro-contas-a-receber #form-cadastro #tipo-pessoa':'changeTipoPessoaAutoComplete'


        })

    }

    novoCadastro(e) {
        e.preventDefault()

        this.render()

    }

    async parcelar(e) {
        e.preventDefault()



        let formParcela = this._model.model($(`${this._hashModal.formParcela} #form-parcela-receitas`)).formObject.parcela || {}

        let formHistorico = this._model.model($(`${this._bloco.principal} #form-financeiro-receita-lancamento-historico`)).formObject.lancamento || {}


        if (formParcela.quantidade === 0 || formParcela.dias === 0)
            return await utils.MessageUtil.alert('É obrigatório informar a quantidade de parcelas e dias para o vencimento!')

        formHistorico.parcela = formParcela

        let [error, data] = await utils.PromiseUtil.to(this._model.saveHistoricoParcelas(formHistorico))
        if (error)
            return await utils.MessageUtil.error(error)

        let conta = await this._model.conta(formHistorico.recebimentoId)

        utils.ModalUtil.forceCloseButton(this._hashModal.formParcela)


        await utils.MessageUtil.alert('Parcelamento realizado com sucesso!', 'success')

        this.render(conta)

    }

    async formParcelaHistorico(e) {
        e.preventDefault()

        let html = await utils.UnderscoreUtil._template('#template-financeiro-receita-lancamento-parcela-form', {})

        let modal = await utils.ModalUtil.modalVTT(html, 'Lançamento de Parcelas', { buttonClose: true, width: '50%' })

        $(modal.element).dialog(modal.config).dialog('open')

        this._hashModal.formParcela = modal.element

    }

    fecharFormularioLancamentoHistorico(e) {
        e.preventDefault()
        $('#block-form-financeiro-contas-a-receber #inner-form-historico').hide()
        $('#block-form-financeiro-contas-a-receber #inner-form-historico-pagamento').hide()
    }

    lancarReceitaDevedor(e) {
        e.preventDefault()

        let param = $(e.currentTarget).attr('data-attr')

        let run = () => {

            let form = this._model.model($(`${this._bloco.principal} ${this._bloco.formCadastro}`))

            if (!form.formObject.id)
                return false

            form.formObject.status = param

            this._model.save(form.formObject, false).then((r) => {

                utils.MessageUtil.message(r.message, 'info', {
                    buttons: {
                        'Fechar': (event) => {
                            utils.MessageUtil.closeButton(event)
                            cache.conta = r.data
                            this.renderCadastro(r.data)
                        }
                    }
                })
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

        utils.MessageUtil.message(`ATENÇÃO: O status desta conta será alterada para ${param}! Deseja continuar?`,
            'warning',
            options)
    }

    async formCheque(e) {
        e.preventDefault()

        let html = await utils.UnderscoreUtil._template('#template-financeiro-receita-lancamento-cheque-form', {})

        let modal = await utils.ModalUtil.modalVTT(html, 'Lançamento de Cheque', { buttonClose: true, width: '50%' })

        $(modal.element).dialog(modal.config).dialog('open')

        this._hashModal.formCheque = modal.element

    }

    async changeFormaPagamento(e, param = {}) {
        e.preventDefault()

        $(`${this._bloco.principal} #bloco-data-bom-para`).hide()

        let value = $(e.currentTarget).val()

        if (['cheque_pre', 'recibo', 'boleto_a_prazo', 'deposito'].indexOf(value) !== -1)
            $(`${this._bloco.principal} #bloco-data-bom-para`).show()

        if ([true, undefined].indexOf(param.isModalCheque) !== -1)
            if (['cheque_pre', 'cheque'].indexOf(value) !== -1)
                await this.formCheque(e)


    }

    pagamento(e, historico) {
        e.preventDefault()

        try {

            let data = {}

            if (!historico) {

                historico = utils.FormUtil.mapObject(`${this._bloco.principal} #form-financeiro-receita-pagamento-historico`).formObject



                data = utils.JsonUtil.toParse($("#form-financeiro-receita-pagamento-historico").attr('data-item'))


                if (!utils.ObjectUtil.hasProperty(historico, 'lancamento'))
                    throw 'Objeto inválido! Atualize a página!'

            } else {



                historico.lancamento.status = 'paga'
                historico.lancamento.isPagamentoMarcado = true

            }


            let retorno = async () => {

                try {

                    let r = await this._model.recebimento(historico.lancamento)

                    $(`${this._bloco.principal} #inner-form-historico`).html('').hide()

                    $(`${this._bloco.principal} #inner-form-historico-pagamento`).html('').show()


                    let conta = await this._model.conta(historico.lancamento.recebimentoId)

                    new ContaReceberView(conta)


                } catch (err) {
                    utils.MessageUtil.error(err)
                }

            }

            if (!historico.lancamento.isPagamentoMarcado && (utils.NumberUtil.cdbl(historico.lancamento.valorPago) < utils.NumberUtil.cdbl(data.valor))) {

                let options = {
                    buttons: {
                        'Sim': (e) => {
                            historico.lancamento.lancarNovaConta = true
                            retorno()
                            utils.MessageUtil.closeButton(e)
                        },
                        'Não': (e) => {
                            retorno()
                            utils.MessageUtil.closeButton(e)
                        },
                        'Fechar': (e) => {
                            utils.MessageUtil.closeButton(e)
                        }
                    }
                }



                utils.MessageUtil.message('Atenção!<br />O valor da conta é menor que o valor a receber!<br />Deseja lançar uma nova parcela?',
                    'success',
                    options)

            } else if (!historico.lancamento.isPagamentoMarcado && (utils.NumberUtil.cdbl(historico.lancamento.valorPago) > utils.NumberUtil.cdbl(data.valor))) {

                let options = {
                    buttons: {
                        'Sim': (e) => {
                            retorno()
                            utils.MessageUtil.closeButton(e)
                        },
                        'Não': (e) => {
                            utils.MessageUtil.closeButton(e)
                        }
                    }
                }



                utils.MessageUtil.message('Atenção!<br />O valor pago é maior que o valor do lançamento!<br />Deseja continuar?',
                    'warning',
                    options)

            } else {
                retorno()
            }

        } catch (err) {
            utils.MessageUtil.error(err)
        }
    }


    pagamentoHistorico(e) {
        e.preventDefault()

        let data = utils.JsonUtil.toParse($(e.currentTarget).closest('.row-item-list').attr('data-item'))

        this.renderPagamentoHistorico(data)
    }

    editarHistorico(e) {
        e.preventDefault()

        let data = utils.JsonUtil.toParse($(e.currentTarget).closest('.row-item-list').attr('data-item'))

        this.renderHistorico(data)


    }

    lancarReceitaComoPaga(e) {
        e.preventDefault()

        let historico = utils.JsonUtil.toParse($(e.currentTarget).closest('.row-item-list').attr('data-item'))

        this.pagamento(e, { lancamento: historico })
    }


    lancarHistorico(e, historico) {
        e.preventDefault()

        let conta = utils.FormUtil.mapObject(`${this._bloco.principal} ${this._bloco.formCadastro}`)

        let lancamento = conta.formObject.lancamento


        if (historico) {
            lancamento = historico
            lancamento.status = 'paga'
            lancamento.isPagamentoMarcado = true
        } else {
            lancamento.recebimentoId = conta.formObject.id
        }

        this._model.saveHistorico(lancamento).then((r) => {

            let historicoCache = _.find(cache.conta.historicos, { id: r.id })

            if (historicoCache) {

                let historicos = []

                cache.conta.historicos.forEach((item) => {
                    if (item.id == r.id)
                        item = r

                    historicos.push(item)
                })

                cache.conta.historicos = historicos
            } else {
                cache.conta.historicos.push(r)
            }

            this.renderCadastro(cache.conta)

        }).catch((err) => {
            utils.MessageUtil.error(err)
        })

    }


    save(e, options = {}) {
        e.preventDefault()

        this._model.save($(`${this._bloco.principal} ${this._bloco.formCadastro}`)).then((r) => {

            utils.MessageUtil.message(r.message, 'info', {
                buttons: {
                    'Fechar': async (event) => {
                        utils.MessageUtil.closeButton(event)

                        cache.conta = r.data

                        if (r.data.historicos.length == 0) {
                            let historico = await this._model.saveHistorico({
                                vencimento: r.data.data,
                                valor: r.data.valor,
                                recebimentoId: r.data.id,
                                status: r.data.status
                            })

                            cache.conta.historicos.push(historico)
                        }

                        this.renderCadastro(r.data)
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

        this.renderCadastro(data)
    }


    changeTipoPessoaAutoComplete(e){
        let type = $(e.currentTarget).val()
        this.renderAutoCompletePessoa(type)
    }

    selectTipoPessoaByPessoa(tipoPessoa){
        if(!tipoPessoa)
            return false

        let block = $('#block-form-financeiro-contas-a-receber #form-cadastro')

        block.find('#tipo-pessoa:radio').filter( (i, item) => {
            $(item).attr('checked', false)
            $(item).attr({'disabled':true})
            if($(item).val() == tipoPessoa)
                $(item).attr({checked: true})
        })
    }

    renderAutoCompletePessoa(type , data = {}){

        let name = ''

        switch(type){
            case 'cliente':
            case 'fabrica':
            case 'cedente':
                name = _.get(data, `pessoa.${type}.razaoSocial`)
                break
            case 'vendedor':
                name = _.get(data, 'pessoa.vendedor.nome')
                break
        }

        $('#inner-pessoa-autocomplete').html('')
        

        if(!type)
            return false


        utils.UnderscoreUtil._template('#template-geral-autocomplete-pessoa', { data: {title: type, name: name } }, '#inner-pessoa-autocomplete')

        utils.AutoCompleteUtil.AutoComplete({
            type: type,
            bloco: '#block-form-financeiro-contas-a-receber #bloco-autocomplete-pessoa',
            input: 'input[name="pessoaId"]',
            isClearValue: false,
            parent: '#form-cadastro'

        })

        if(_.get(data, 'pessoa.id'))
            $('#block-form-financeiro-contas-a-receber #bloco-autocomplete-pessoa').attr('disabled','disabled')
    }



    renderHistoricosLancados(data = {}) {

        if (!_.isArray(data.historicos))
            return
        else if (data.historicos.length == 0)
            return

        $(`${this._bloco.principal} #inner-historicos-lancados`).show()


        utils.UnderscoreUtil._template('#template-financeiro-receita-historicos-lancados', { historicos: data.historicos, conta: data.conta }, '#inner-historicos-lancados')


        $("#block-form-financeiro-contas-a-receber #form-cadastro .status-print").each((i, item) => {

            let row = $(item).closest('.row-item-list')

            //let formasPagamentoPrazo = ['cheque_pre', 'recibo', 'boleto_a_prazo', 'deposito']

            let historico = utils.JsonUtil.toParse($(row).attr('data-item'))

            if (['cancelada', 'paga'].indexOf(data.status) != -1) {

                $(row).find('.bloco-botoes-historicos-contas-lancados').html('')

            } else {

                //if (['aberta'].indexOf(data.status) != -1) {

                switch (historico.status) {
                    case 'paga':
                    case 'cancelada':
                        $(row).find('.btn-lancar-receita-paga').hide()
                        $(row).find('.editar-historico-lancado').hide()
                        $(row).find('.pagar-historico-lancado').hide()
                        break
                    case 'pendente':
                        //if (formasPagamentoPrazo.indexOf(historico.formaPagamento) != -1) {
                        $(row).find('.pagar-historico-lancado').hide()
                        $(row).find('.btn-lancar-receita-paga').show()
                        //} else {
                        //    $(row).find('.pagar-historico-lancado').show()
                        //   $(row).find('.btn-lancar-receita-paga').hide()
                        //}
                        break
                }

                //}
            }
        })
    }

    renderFormaPagamentoSelectBox(data = {}, bloco) {



        utils.ApiUtil.formasPagamento().then((r) => {

            let options = '<option value="">Selecione</option>'

            r.forEach((item) => {

                options += `<option value="${item.value}" ${data.formaPagamento == item.value ? 'selected' : ''}>${item.text}</option>`

            })

            $(bloco)
                .html(options)
                .trigger('change', { isModalCheque: false })
        })


    }


    renderPagamentoHistorico(data = {}) {

        $(`${this._bloco.principal} #inner-form-historico`).html('').hide()

        $(`${this._bloco.principal} #inner-form-historico-pagamento`).html('').show()

        utils.UnderscoreUtil._template('#template-financeiro-receita-historicos-pagamento-form', { historico: data }, '#inner-form-historico-pagamento')

        this.renderFormaPagamentoSelectBox(data, '#block-form-financeiro-contas-a-receber #form-financeiro-receita-pagamento-historico #lancamento-forma-pagamento')
    }


    renderHistorico(data = {}) {

        $(`${this._bloco.principal} #inner-form-historico-pagamento`).html('').hide()


        $(`${this._bloco.principal} #inner-form-historico`).html('').show()

        if (!data.status)
            data.status = 'aberta'

        if (data.id) {
            if (data.valorPago > 0)
                data.valor = data.valorPago
        }

        if (!utils.ObjectUtil.getValueProperty(data, 'pedidoClienteId'))
            utils.UnderscoreUtil._template('#template-financeiro-receita-lancamento-historico-form', { historico: data }, '#inner-form-historico')

        this.renderFormaPagamentoSelectBox(data, '#block-form-financeiro-contas-a-receber #form-financeiro-receita-lancamento-historico #lancamento-forma-pagamento')

        if (data.id) {
            $('#block-form-financeiro-contas-a-receber #lancamento-valor').attr({ 'disabled': true })
            $('#block-form-financeiro-contas-a-receber #lancamento-juro').attr({ 'disabled': true })
            $('#block-form-financeiro-contas-a-receber .adicionar-historico').text('Atualizar')

        }


    }

    renderCadastro(data = {}) {

        try {




            $(`${this._bloco.principal} #inner-form-historico`).html('').hide()
            $(`${this._bloco.principal} #inner-historicos-lancados`).html('').hide()

            this.breadCrumbs()

            utils.HtmlUtil.loader()

            if (data.id === undefined)
                this._bread.add('Novo Cadastro').show()
            else
                this._bread.add(`Edição de Cadastro ${data.id}`).show()



            //Template layout.pug
            utils.UnderscoreUtil._template('#template-financeiro-receita', {}, '#inner-content')

            //template receita.pug
            utils.UnderscoreUtil._template('#template-children-financeiro-receita', {}, '#inner-content-children')

            //tempalte notafiscal.pug
            utils.UnderscoreUtil._template('#template-children-financeiro-receita-lancamento', {}, '#inner-content-children-financeiro-receita')


            utils.UnderscoreUtil._template('#template-financeiro-receita-lancamento-form-principal', {}, '#inner-content-children-financeiro-receita')


            this.selectTipoPessoaByPessoa(_.get(data, 'pessoa.tipoPessoa'))

            this.renderAutoCompletePessoa( _.get(data, 'pessoa.tipoPessoa') ,data)

            utils.UnderscoreUtil._template('#template-financeiro-receita-lancamento-cabecalho', { form: data }, '#inner-cabecalho')




            if (data.id) {

                $("#block-form-financeiro-contas-a-receber #btn-lancar-receita").text('Save')




                $('#block-form-financeiro-contas-a-receber #bloco-autocomplete-pedido-cliente').attr({ 'disabled': true })

                $("#block-form-financeiro-contas-a-receber #bloco-btn-lancar").hide()

                if (utils.ObjectUtil.hasProperty(data.pedidoCliente, 'id'))
                    $('#block-form-financeiro-contas-a-receber #form-cadastro #descricao').attr({ 'disabled': true })

                $('#block-form-financeiro-contas-a-receber #form-cadastro #valor').attr({ 'disabled': true })


                //if (['cancelada', 'paga', 'pendente'].indexOf(data.status) == -1)
                //    this.renderHistorico(data)


                if (['cancelada', 'paga'].indexOf(data.status) != -1) {
                    $("#block-form-financeiro-contas-a-receber #btn-lancar-receita").hide()
                    $('#block-form-financeiro-contas-a-receber #form-cadastro .form-control').each((i, item) => { $(item).attr('disabled', true) })
                }


                this.renderHistoricosLancados(data)


                if (['devedor', 'cartorio'].indexOf(data.status) !== -1) {

                    $('#block-form-financeiro-contas-a-receber #form-cadastro .bloco-botoes-historicos-contas-lancados').hide()
                    $('#block-form-financeiro-contas-a-receber #form-cadastro #btn-lancar-receita').hide()
                    $('#block-form-financeiro-contas-a-receber #form-cadastro #block-botoes-devedor-contas-a-receber').hide()
                    $('#block-form-financeiro-contas-a-receber #form-cadastro #block-botoes-voltar-conta-pentente-contas-a-receber').show()
                } else if (['aberta', 'pendente'].indexOf(data.status) !== -1) {
                    $('#block-form-financeiro-contas-a-receber #form-cadastro #block-botoes-devedor-contas-a-receber').show()
                }





            } else {
                $("#block-form-financeiro-contas-a-receber #btn-lancar-receita").text('Lançar')
            }




        } catch (err) {
            utils.MessageUtil.error(err)
        }
    }

    render(conta = {}) {
        try {

            if (conta)
                cache.conta = conta

            utils.HtmlUtil.loader()

            this._bread.show()

            this.renderCadastro(conta)

        } catch (err) {
            utils.MessageUtil.message(err, 'danger')
        }
        return this
    }


}


module.exports = {
    ContaReceberView: (data) => { return new ContaReceberView(data) },
    ContaReceberListView: () => { return new ContaReceberListView() }
} 