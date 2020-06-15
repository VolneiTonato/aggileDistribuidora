const utils = require('../../../../../../helpers/utils-admin')

let cache = {
    conta: {}
}


const privateMethod = {
    trocoPagamentoMethod: Symbol('trocoPagamentoMethod'),
    validarValorNovaParcelaPagamentoMethod: Symbol('validarValorNovaParcelaPagamentoMethod'),
    registrarPagamentoMethod: Symbol('registrarPagamentoMethod')
}


module.exports = class FinanceiroContaReceberView extends Backbone.View {
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

        this.$el = $('body')

        this.overrideEvents()

        this._hashModal = {
            formCheque: '',
            formParcela: ''
        }


        process.nextTick(() => {
            this._model = new (require('../../../models/receita'))()
            this._modelCheque = require('../../../models/cheque')
            this._formParcela = require('./receita-form-parcela-view')
            this._formTroco = require('./receita-form-troco-view')
            this.render(conta)
        })
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
        this.$el.off('click', '#block-list-financeiro-receita #btn-novo-cadastro')
        this.$el.off('click', '#block-form-financeiro-contas-a-receber #form-cadastro .btn-lancar-receita-paga')
        this.$el.off('click', '#block-form-financeiro-contas-a-receber .lancar-historico-devedor')
        this.$el.off('click', '#block-form-financeiro-contas-a-receber .cancelar-lancamento-historico')
        this.$el.off('change', '#block-form-financeiro-contas-a-receber #form-cadastro .tipo-pessoa')
        this.$el.off('focusout', '#block-form-financeiro-contas-a-receber #form-cadastro #lancamento-desconto')
        this.$el.off('focusout', '#block-form-financeiro-contas-a-receber #form-cadastro #lancamento-desconto-percent')
        this.$el.off('focusout', '#block-form-financeiro-contas-a-receber #form-cadastro #lancamento-juro')
        this.$el.off('focusout', '#block-form-financeiro-contas-a-receber #form-cadastro #lancamento-juro-percent')
        this.$el.off('focusout', '#block-form-financeiro-contas-a-receber #form-cadastro #lancamento-valor-total')
        this.$el.off('focusout', '#block-form-financeiro-contas-a-receber #form-cadastro #lancamento-valor-recebido')

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
            'click #block-list-financeiro-receita #btn-novo-cadastro': 'renderCadastro',
            'click #block-form-financeiro-contas-a-receber #form-cadastro .btn-lancar-receita-paga': 'lancarReceitaComoPaga',
            'click #block-form-financeiro-contas-a-receber .lancar-historico-devedor': 'lancarReceitaDevedor',
            'click #block-form-financeiro-contas-a-receber .cancelar-lancamento-historico': 'fecharFormularioLancamentoHistorico',
            'change #block-form-financeiro-contas-a-receber #form-cadastro .tipo-pessoa': 'changeTipoPessoaAutoComplete',
            'click #block-form-financeiro-contas-a-receber .limpar-forma-pgto-selecionada': 'clearFormaPagamentoSelecionada',
            'focusout #block-form-financeiro-contas-a-receber #form-cadastro #lancamento-desconto': 'calcularTotais',
            'focusout #block-form-financeiro-contas-a-receber #form-cadastro #lancamento-desconto-percent': 'calcularTotais',
            'focusout #block-form-financeiro-contas-a-receber #form-cadastro #lancamento-juro': 'calcularTotais',
            'focusout #block-form-financeiro-contas-a-receber #form-cadastro #lancamento-juro-percent': 'calcularTotais',
            'focusout #block-form-financeiro-contas-a-receber #form-cadastro #lancamento-valor-total': 'calcularTotais',
            'focusout #block-form-financeiro-contas-a-receber #form-cadastro #lancamento-valor-recebido': 'calcularTotais',



        })

    }

    clearFormaPagamentoSelecionada(e) {
        e.preventDefault()

        try {

            let parent = $(e.currentTarget).closest('#form-cadastro')

            parent.find('#lancamento-forma-pagamento option')
                .removeAttr('selected').filter('[value=""]')
                .attr('selected', true)

            parent.find('#lancamento_data_bom_para').val('')
            parent.find('#bloco-data-bom-para').css('visibility', 'hidden')

            this.renderChequeSelecionado()

        } catch (err) {

        }
    }

    calcularTotais(e) {
        e.preventDefault()

        try {

            let valor = $(e.currentTarget).val()

            let tipoCalculo = $(e.currentTarget).attr('data-attr')


            let objectElement = this._model.model((e.currentTarget).closest('#form-financeiro-receita-lancamento-historico'))

            let element = _.get(objectElement.formElement, 'lancamento')

            let form = _.get(objectElement.formObject, 'lancamento')

            let historico = utils.JsonUtil.toParse($(e.currentTarget).closest('#form-financeiro-receita-lancamento-historico').attr('data-item'))



            if (['desconto', 'desconto-percentual'].indexOf(tipoCalculo) !== -1) {

                if (tipoCalculo == 'desconto')
                    element.descontoPercentual.val(Math.abs(utils.NumberUtil.calcularVariacaoMaiorParaMenor(historico.valor, historico.valor - form.desconto)))
                else
                    element.desconto.val(utils.NumberUtil.percentualToDecimal(historico.valor, form.descontoPercentual))

                if (valor > 0) {

                    element.juro.val(0.00)
                    element.juroPercentual.val(0.00)
                }

                if (element.juro.val() == 0)
                    element.valorTotal.val(utils.NumberUtil.diminuir(historico.valor, element.desconto.val()))


            } else if (['juro', 'juro-percentual'].indexOf(tipoCalculo) !== -1) {

                if (tipoCalculo == 'juro')
                    element.juroPercentual.val(Math.abs(utils.NumberUtil.calcularVariacaoMenorParaMaior(utils.NumberUtil.sum(historico.valor, form.juro), historico.valor)))
                else
                    element.juro.val(utils.NumberUtil.percentualToDecimal(historico.valor, form.juroPercentual))

                if (valor > 0) {

                    element.desconto.val(0.00)
                    element.descontoPercentual.val(0.00)
                }

                if (element.desconto.val() == 0)
                    element.valorTotal.val(utils.NumberUtil.sum(historico.valor, element.juro.val()))

            } else if (tipoCalculo == 'valor-recebido') {

                if(utils.NumberUtil.cdbl(element.valorTotal.val()) > utils.NumberUtil.cdbl(valor))
                    element.valorRecebido.val(element.valorTotal.val())


            }else if (tipoCalculo == 'valor-total') {

                element.valorTotal.val(valor)

             

                if (utils.NumberUtil.cdbl(form.valorTotal) >  utils.NumberUtil.cdbl(historico.valor)) {

                    let juro = form.valorTotal - historico.valor

                    element.juro.val(juro)



                    if (valor > 0) {
                        element.desconto.val(0.00)
                        element.descontoPercentual.val(0.00)
                    }


                    element.juroPercentual.val(Math.abs(utils.NumberUtil.decimalToPercentual(form.valorTotal, historico.valor)))

                } else if (utils.NumberUtil.cdbl(form.valorTotal) <  utils.NumberUtil.cdbl(historico.valor)) {

                    let desconto = historico.valor - form.valorTotal

                    element.desconto.val(desconto)

                    element.descontoPercentual.val(Math.abs(utils.NumberUtil.calcularVariacaoMaiorParaMenor(historico.valor, form.valorTotal)))

                    if (valor > 0) {
                        element.juro.val(0.00)
                        element.juroPercentual.val(0.00)
                    }

                } else {
                    element.juro.val(0.00)
                    element.juroPercentual.val(0.00)
                    element.desconto.val(0.00)
                    element.descontoPercentual.val(0.00)
                }

                element.valorRecebido.val(element.valorTotal.val())
            }



        } catch (err) {

        }





    }

    fecharFormularioLancamentoHistorico(e) {
        e.preventDefault()
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


        let html = await utils.UnderscoreUtil._template('#template-geral-autocomplete-cheque', {})

        let modal = await utils.ModalUtil.modalVTT(html, 'Pesquisa de Cheque', { buttonClose: true, width: '50%' })

        _.assign(modal.config.buttons, {
            'Selecionar Cheque': async (e) => {
                e.preventDefault()
                utils.ModalUtil.forceCloseButton(this._hashModal.formCheque)

                this.renderChequeSelecionado(this._chequeSelecionadoLancamento)

            }
        })

        $(modal.element).dialog(modal.config).dialog('open')


        this._hashModal.formCheque = modal.element

        let awaitLoad = async () => {
            await utils.PromiseUtil.sleep()

            let target = document.querySelector(`${modal.element} #bloco-autocomplete-cheque`)

            if (!target)
                await awaitLoad()
            else
                this.renderAutoCompleteCheque()

        }

        await awaitLoad()

    }


    renderAutoCompleteCheque() {

        utils.AutoCompleteUtil.AutoComplete({
            type: 'cheque',
            queryString: { status: ['pendente', 'devolvido', 'repasse_pagamento', 'recebido'] },
            bloco: `${this._hashModal.formCheque} #bloco-autocomplete-cheque`,
            isClearValue: false,
            minText: 1,
            callback: async (item) => {

                this._chequeSelecionadoLancamento = _.get(item, 'data')

                let html = await utils.UnderscoreUtil._template('#template-financeiro-cheque-dados-cheque', { form: this._chequeSelecionadoLancamento })

                if ($(`${this._hashModal.element} #dados-cheque-autocomplete`).length > 0)
                    $(`${this._hashModal.formCheque}`).find('#dados-cheque-autocomplete').remove()

                $(`${this._hashModal.formCheque}`).append(`<div id="dados-cheque-autocomplete">${html}</div>`)

            }
        })

    }

    async changeFormaPagamento(e, param = {}) {
        e.preventDefault()

        this._chequeSelecionadoLancamento = null
        this._valoresChequesLancado = null

        $(`${this._bloco.principal} #bloco-data-bom-para`).css('visibility', 'hidden')

        let value = $(e.currentTarget).val()

        if (['recibo', 'boleto_a_prazo', 'deposito'].indexOf(value) !== -1)
            $(`${this._bloco.principal} #bloco-data-bom-para`).css('visibility', 'visible')

        if ([true, undefined].indexOf(param.isModalCheque) !== -1)
            if (['cheque_pre', 'cheque'].indexOf(value) !== -1)
                await this.formCheque(e)
        


    }


    async [privateMethod.trocoPagamentoMethod](historicoForm, historicoJSON) {


        const run = async () => {

            if (['cheque', 'cheque_pre'].indexOf(_.get(historicoForm, 'lancamento.formaPagamento')) !== -1 && _.get(this._chequeSelecionadoLancamento, 'id') > 0)
                _.set(historicoForm, 'lancamento.valorTotal', _.get(this._valoresChequesLancado, 'valorPendenteReceita'))

            //let valorTroco = utils.NumberUtil.cdbl(_.get(historicoForm, 'lancamento.valorTotal') - historicoJSON.valor)
            let valorTroco = utils.NumberUtil.cdbl(_.get(historicoForm, 'lancamento.valorRecebido') - _.get(historicoForm, 'lancamento.valorTotal')) //- historicoJSON.valor)



            utils.EventUtil.on('event.financeiro.receita.callFormTrocoInformado', (data) => {

                if (_.get(data, 'troco'))
                    historicoForm.lancamento.troco = data.troco



                this[privateMethod.validarValorNovaParcelaPagamentoMethod](historicoForm, historicoJSON)
            })

            new this._formTroco(valorTroco)
        }





        if (['cheque', 'cheque_pre'].indexOf(_.get(historicoForm, 'lancamento.formaPagamento')) !== -1 && _.get(this._chequeSelecionadoLancamento, 'id') > 0) {

            let msg = `Deseja lançar o valor total do cheque para essa conta?<br />
                Total Cheque: R$ ${_.get(this._chequeSelecionadoLancamento, 'valor')}<br />
                Valor Pendente: R$ ${_.get(this._valoresChequesLancado, 'valorPendenteReceita')}<br />
                Valor Lançamento Conta Atual: R$ ${_.get(historicoForm, 'lancamento.valorTotal')}<br />
            `
            let options = {
                buttons: {
                    'Sim': async (e) => {

                        utils.MessageUtil.closeButton(e)

                        run()

                    },
                    'Não': async (e) => {
                        utils.MessageUtil.closeButton(e)

                        return await this[privateMethod.validarValorNovaParcelaPagamentoMethod](historicoForm, historicoJSON)
                    }
                }
            }

            await utils.MessageUtil.message(`${msg}`,
                'warning',
                options)

        } else {
            run()
        }

    }

    async [privateMethod.validarValorNovaParcelaPagamentoMethod](historicoForm, historicoJSON) {

        let { valorTotal, valorRecebido, troco } = _.get(historicoForm, 'lancamento')



        if (!historicoForm.lancamento.isPagamentoMarcado && (utils.NumberUtil.cdbl(valorTotal) < utils.NumberUtil.cdbl(historicoJSON.valor))) {

            let options = {
                buttons: {
                    'Sim': (e) => {
                        historicoForm.lancamento.lancarNovaConta = true
                        this[privateMethod.registrarPagamentoMethod](historicoForm)
                        utils.MessageUtil.closeButton(e)
                    },
                    'Não': (e) => {
                        this[privateMethod.registrarPagamentoMethod](historicoForm)
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

        } else {
            this[privateMethod.registrarPagamentoMethod](historicoForm)
        }
    }

    async [privateMethod.registrarPagamentoMethod](historicoForm = {}) {
        try {

            let r = await this._model.recebimento(historicoForm.lancamento)



            $(`${this._bloco.principal} #inner-form-historico-pagamento`).html('').show()


            let conta = await this._model.conta(historicoForm.lancamento.recebimentoId)

            new FinanceiroContaReceberView(conta)

            return true

        } catch (err) {
            utils.MessageUtil.error(err)
        }
    }


    pagamento(e, historico) {
        e.preventDefault()

        try {

            let historicoJSON = {}

            if (!historico) {

                historico = utils.FormUtil.mapObject(`${this._bloco.principal} #form-financeiro-receita-lancamento-historico`).formObject



                historicoJSON = utils.JsonUtil.toParse($("#form-financeiro-receita-lancamento-historico").attr('data-item'))


                if (!utils.ObjectUtil.hasProperty(historico, 'lancamento'))
                    throw 'Objeto inválido! Atualize a página!'

            } else {



                historico.lancamento.status = 'paga'
                historico.lancamento.isPagamentoMarcado = true

            }


            if (utils.NumberUtil.cdbl(historico.valorRecebido) < utils.NumberUtil.cdbl(historico.valorTotal))
                throw `O valor recebido não pode ser menor que o valor total do pagamento!`

            if (utils.NumberUtil.cdbl(_.get(this._valoresChequesLancado, 'valorPendenteReceita')) > utils.NumberUtil.cdbl(historico.lancamento.valorTotal))
                this[privateMethod.trocoPagamentoMethod](historico, historicoJSON)
            else if (utils.NumberUtil.cdbl(_.get(historico, 'lancamento.valorRecebido')) > utils.NumberUtil.cdbl(_.get(historico, 'lancamento.valorTotal')))
                this[privateMethod.trocoPagamentoMethod](historico, historicoJSON)
            else
                this[privateMethod.validarValorNovaParcelaPagamentoMethod](historico, historicoJSON)


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

                let historicos = cache.conta.historicos.map((item) => {
                    if (item.id == r.id)
                        item = r

                    return item
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

                        cache.conta.historicos = _.get(r, 'data.historicos')

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


    changeTipoPessoaAutoComplete(e) {
        let type = $(e.currentTarget).val()
        this.renderAutoCompletePessoa(type)
    }

    selectTipoPessoaByPessoa(tipoPessoa) {
        if (!tipoPessoa)
            return false

        let block = $('#block-form-financeiro-contas-a-receber #form-cadastro')

        block.find('.tipo-pessoa:radio').filter((i, item) => {
            $(item).attr('checked', false)
            $(item).attr({ 'disabled': true })
            if ($(item).val() == tipoPessoa)
                $(item).attr({ checked: true })
        })
    }

    renderAutoCompletePessoa(type, data = {}) {

        let name = ''

        switch (type) {
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


        if (!type)
            return false


        utils.UnderscoreUtil._template('#template-geral-autocomplete-pessoa', { data: { title: type, name: name } }, '#inner-pessoa-autocomplete')

        utils.AutoCompleteUtil.AutoComplete({
            type: type,
            bloco: '#block-form-financeiro-contas-a-receber #bloco-autocomplete-pessoa',
            input: 'input[name="pessoaId"]',
            isClearValue: false,
            parent: '#form-cadastro'

        })

        if (_.get(data, 'pessoa.id'))
            $('#block-form-financeiro-contas-a-receber #bloco-autocomplete-pessoa').attr('disabled', 'disabled')
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



                switch (historico.status) {
                    case 'paga':
                    case 'cancelada':
                    case 'estornada':
                        $(row).find('.bloco-botoes-historicos-contas-lancados .btn-lancar-receita-paga').hide()
                        $(row).find('.bloco-botoes-historicos-contas-lancados .editar-historico-lancado').hide()
                        $(row).find('.bloco-botoes-historicos-contas-lancados .pagar-historico-lancado').hide()
                        break
                    case 'pendente':
                        $(row).find('.bloco-botoes-historicos-contas-lancados .pagar-historico-lancado').hide()
                        $(row).find('.bloco-botoes-historicos-contas-lancados .btn-lancar-receita-paga').show()
                        break
                }
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

    async renderValoresLancadosConta(chequeId) {

        try {
            let response = await new this._modelCheque().obterValoresLancadosContas(chequeId)



            this._valoresChequesLancado = response

            await utils.UnderscoreUtil._template('#template-financeiro-cheque-dados-valor-lancado-contas', { form: response }, '#inner-form-historico-pagamento #inner-valor-usado-cheque')
        } catch (err) {
            return utils.MessageUtil.error(err, 'danger')
        }
    }


    async renderPagamentoHistorico(data = {}) {

        $(`${this._bloco.principal} #inner-form-historico-pagamento`).html('').show()

        if(data.valorTotal == 0)
            data.valorTotal = data.valor

        await utils.UnderscoreUtil._template('#template-financeiro-receita-historicos-pagamento-form', { historico: data }, '#inner-form-historico-pagamento')

        this.renderFormaPagamentoSelectBox(data, '#block-form-financeiro-contas-a-receber #form-financeiro-receita-lancamento-historico #lancamento-forma-pagamento')

        if (_.get(data, 'cheque.id')) {
            this._chequeSelecionadoLancamento = data.cheque

            this.renderValoresLancadosConta(_.get(data, 'cheque.id'))

            await utils.UnderscoreUtil._template('#template-financeiro-cheque-dados-cheque', { form: data.cheque }, '#inner-form-historico-pagamento #inner-bloco-dados-cheque-selecionado')
        }
    }


    async renderChequeSelecionado(cheque = {}) {

        try {
            if (_.get(cheque, 'id')) {

                this._chequeSelecionadoLancamento = cheque

                this.renderValoresLancadosConta(_.get(cheque, 'id'))

                await utils.UnderscoreUtil._template('#template-financeiro-cheque-dados-cheque', { form: cheque }, '#block-form-financeiro-contas-a-receber #form-financeiro-receita-lancamento-historico #inner-bloco-dados-cheque-selecionado')

                $('#block-form-financeiro-contas-a-receber #form-financeiro-receita-lancamento-historico #inner-bloco-dados-cheque-selecionado').slideDown()

                $('#block-form-financeiro-contas-a-receber #form-financeiro-receita-lancamento-historico input[name="lancamento_chequeId"]').val(cheque.id)

            } else {
                $('#block-form-financeiro-contas-a-receber #form-financeiro-receita-lancamento-historico #inner-bloco-dados-cheque-selecionado').slideUp().html('')

                $('#block-form-financeiro-contas-a-receber #form-financeiro-receita-lancamento-historico').find('#lancamento-cheque-id').val('')

                $('#block-form-financeiro-contas-a-receber #form-financeiro-receita-lancamento-historico #inner-valor-usado-cheque').html('')

            }
        } catch (err) {

        }
    }


    renderHistorico(data = {}) {

        $(`${this._bloco.principal} #inner-form-historico-pagamento`).html('').show()


        if (!data.status)
            data.status = 'aberta'

        if (data.id) {
            if (data.valorTotal > 0)
                data.valor = data.valorTotal
        }

        if (!utils.ObjectUtil.getValueProperty(data, 'pedidoClienteId'))
            utils.UnderscoreUtil._template('#template-financeiro-receita-lancamento-historico-form', { historico: data }, '#inner-form-historico-pagamento')

        this.renderFormaPagamentoSelectBox(data, '#block-form-financeiro-contas-a-receber #form-financeiro-receita-lancamento-historico #lancamento-forma-pagamento')

        this.renderChequeSelecionado(_.get(data, 'cheque'))

        /*
        if (data.id) {
            $('#block-form-financeiro-contas-a-receber #lancamento-valor').attr({ 'disabled': true })
            $('#block-form-financeiro-contas-a-receber #lancamento-juro').attr({ 'disabled': true })
            $('#block-form-financeiro-contas-a-receber .adicionar-historico').text('Atualizar')

        }*/


    }


    callFormParcela() {

        utils.EventUtil.on('event.financeiro.receita.renderContaBeforeParcela', (conta) => {

            this.render(conta)
        })

        new this._formParcela()

    }

    renderCadastro(data = {}) {

        try {

            $(`${this._bloco.principal} #inner-form-historico-pagamento`).html('').hide()

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

            this.renderAutoCompletePessoa(_.get(data, 'pessoa.tipoPessoa'), data)

            utils.UnderscoreUtil._template('#template-financeiro-receita-lancamento-cabecalho', { form: data }, '#inner-cabecalho')




            if (data.id) {

                $("#block-form-financeiro-contas-a-receber #btn-lancar-receita").text('Save')




                $('#block-form-financeiro-contas-a-receber #bloco-autocomplete-pedido-cliente').attr({ 'disabled': true })

                $("#block-form-financeiro-contas-a-receber #bloco-btn-lancar").hide()

                if (utils.ObjectUtil.hasProperty(data.pedidoCliente, 'id'))
                    $('#block-form-financeiro-contas-a-receber #form-cadastro #descricao').attr({ 'disabled': true })

                $('#block-form-financeiro-contas-a-receber #form-cadastro #valor').attr({ 'disabled': true })


                if (['cancelada', 'paga', 'estornada'].indexOf(data.status) != -1) {
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



                this.callFormParcela()

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