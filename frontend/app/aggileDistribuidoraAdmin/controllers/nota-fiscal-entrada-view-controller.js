let utils = require('../../../helpers/utils-admin')


let _cache = {
    produtosLancados: [],
    notaFiscal: {}
}

let paginator = utils.PaginatorUtil.paginator()


class NotaFiscalEntradaModel extends utils.BackboneModelUtil {

    constructor() {
        super()
    }

    defaults() {

    }


    model(form) {
        return utils.FormUtil.mapObject(form)
    }

    async findAllNotas(data) {

        _.assign(data, paginator)

        this.url = utils.UrlUtil.url(`admin/notas-entrada/listar-notas`)

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

    async save(data, isForm = true) {
        this.url = utils.UrlUtil.url(`admin/notas-entrada/save`)

        let send = { data: isForm ? this.model(data).formObject : data, type: 'POST' }

        return await this.fetch(send)
    }

    async cancelarNotaFiscal(data) {
        this.url = utils.UrlUtil.url(`admin/notas-entrada/cancelar-nota-fiscal`)

        let send = { data: data, type: 'POST' }

        return await this.fetch(send)
    }

    async saveItem(data) {
        this.url = utils.UrlUtil.url(`admin/notas-entrada/save-item`)

        let send = { data: data, type: 'POST' }

        return await this.fetch(send)
    }

    async removeItem(itemEntrada = {}, nf = undefined) {

        this.url = utils.UrlUtil.url(`admin/notas-entrada/remove-item`)

        let send = {}

        if (nf)
            send = { data: { nf: nf, removeAll: true }, type: 'POST' }
        else
            send = { data: { id: itemEntrada.id, notaEntradaId: itemEntrada.notaEntradaId, produtoId: itemEntrada.produtoId }, type: 'POST' }

        return await this.fetch(send)
    }


    saveNotaView = async (data, options = {}) => {
        let run = () => {

            this.save(data, options.isForm).then((r) => {

                utils.MessageUtil.message(r.message, 'info', {
                    buttons: {
                        'Fechar': (event) => {
                            utils.MessageUtil.closeButton(event)
                            if (options.element)
                                $(options.element).remove()
                            else
                                utils.UrlUtil.loadUrlBackbone('compras/nota-fiscal/pesquisa')

                        }
                    }
                })
            }).catch((err) => {
                utils.MessageUtil.error(err)
            })
        }

        let question = {
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

        let msg = ''


        if (options.isFinalizada)
            msg = 'Deseja marcar a nota de entrada como Finalizada?<br />Após este procedimento, não será mais possível cancelar a Nota Fiscal!'
        else
            msg = 'Deseja finalizar a nota de entrada?<br />Após lançamento, será atualizado o estoque para os produtos!'


        utils.MessageUtil.message(msg, 'warning', question)

    }




    cancelarNotaView = (notaFiscal, self, isEstorno = false) => {

        let run = () => {
            this.cancelarNotaFiscal({ id: notaFiscal.id, isEstorno: isEstorno }).then((r) => {
                utils.MessageUtil.message(r.message, 'info', {
                    buttons: {
                        'Fechar': (e) => {
                            if (self)
                                self.pesquisarCompras(e)
                            else
                                utils.UrlUtil.loadUrlBackbone('compras/nota-fiscal/pesquisa')

                            utils.MessageUtil.closeButton(e)
                        }
                    }
                })
            }).catch((err) => {

                utils.MessageUtil.error(err)
            })
        }


        if (['lancada', 'pendente', 'cancelada'].indexOf(notaFiscal.status) !== -1) {


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

            let msg = ''

            if (notaFiscal.status == 'lancada' && isEstorno == true)
                msg = 'Deseja estonar a Nota Fiscal?<br />As movimentações e estoques irão ser atualizados!'
            else if (notaFiscal.status == 'cancelada' && isEstorno == true)
                msg = 'Deseja voltar a Nota Fiscal para pendente?'
            else if (notaFiscal.status == 'lancada')
                msg = 'Deseja cancelar a Nota Fiscal?<br />As movimentações e estoques irão ser atualizados!'
            else
                msg = 'Deseja realmente cancelar esta Nota Fiscal?'

            utils.MessageUtil.message(msg, 'warning', options)

        }


    }
}



class NotaFiscalEntradaListView extends Backbone.View {
    constructor() {
        super()



        this._bread = new utils.BreadCrumb()

        this._pathUrl = Backbone.history.getFragment()

        paginator = utils.PaginatorUtil.paginator()


        this._model = new NotaFiscalEntradaModel()

        this.$el = $('body')

        this.overrideEvents()

        this.render()
    }


    reset() {
        this.$el.off('click', '#block-list-compra .btn-detalhar-nota')
        this.$el.off('click', '#block-list-compra .pesquisar')
        this.$el.off('click', '#block-list-compra .limpar-pesquisa')
        this.$el.off('click', '#block-list-compra .btn-cancelar-nota')
        this.$el.off('click', '#block-list-compra .btn-estornar-nota')
        this.$el.off('click', '#block-list-compra .carregar-mais')
        this.$el.off('click', '#block-list-compra .btn-visualizar-nota-info')
        this.$el.off('click', '#block-list-compra .btn-marcar-como-finalizada')

    }


    overrideEvents() {
        this.reset()

        this.delegateEvents({
            "click #block-list-compra .btn-detalhar-nota": "visualizarNotaDetalhada",
            'click #block-list-compra .pesquisar': 'pesquisarCompras',
            'click #block-list-compra .limpar-pesquisa': 'limparPesquisaCompras',
            "click #block-list-compra .btn-cancelar-nota": "cancelarNotaFiscal",
            "click #block-list-compra .btn-estornar-nota": "estornarNotaFiscal",
            'click #block-list-compra .carregar-mais': 'carregarMaisItensCadastro',
            'click #block-list-compra .btn-visualizar-nota-info': 'visualizacaoRapida',
            'click #block-list-compra .btn-marcar-como-finalizada': 'marcarComoFinalizada'
        })



    }

    async marcarComoFinalizada(e) {
        e.preventDefault()

        let notaEntrada = utils.JsonUtil.toParse($(e.currentTarget).closest('.row-item-list').attr('data-item'))

        notaEntrada.status = 'finalizada'

        await this._model.saveNotaView(notaEntrada, { isForm: false, isFinalizada: true, element: $(e.currentTarget).closest('.row-item-list') })
    }



    estornarNotaFiscal(e) {
        e.preventDefault()

        let notaFiscal = utils.JsonUtil.toParse($(e.currentTarget).closest('.row-item-list').attr('data-item'))


        this._model.cancelarNotaView(notaFiscal, this, true)
    }


    carregarMaisItensCadastro(e) {
        e.preventDefault()

        $('#block-list-financeiro-receita .carregar-mais').attr({ 'disabled': true })

        this.carregarListaNotasFiscaisCompra({ append: true })
    }





    cancelarNotaFiscal(e) {
        e.preventDefault()

        let notaFiscal = utils.JsonUtil.toParse($(e.currentTarget).closest('.row-item-list').attr('data-item'))


        this._model.cancelarNotaView(notaFiscal, this)

    }


    limparPesquisaCompras(e) {
        e.preventDefault()

        utils.localStorageUtil.removeStorage('ultima_pesquisa_notas_fiscais_cadastro')

        this.renderFormPesquisa()
    }

    pesquisarCompras(e) {
        e.preventDefault()

        let form = utils.FormUtil.mapObject('#block-list-compra #form-pesquisa')

        utils.localStorageUtil.setStorage('ultima_pesquisa_notas_fiscais_cadastro', form.formObject.pesquisa)

        paginator = utils.PaginatorUtil.paginator()

        this.carregarListaNotasFiscaisCompra()

    }

    async visualizacaoRapida(e) {
        e.preventDefault()



        let notaEntrada = utils.JsonUtil.toParse($(e.currentTarget).closest('.row-item-list').attr('data-item'))

        let html = await utils.UnderscoreUtil._template('#template-list-entrada-nota-info-notas-lancadas', { form: notaEntrada, lancamentos: notaEntrada.itens })


        let modal = await utils.ModalUtil.modalVTT(html, `Visualização Nota de Entrada cód: ${notaEntrada.id} e nº: ${notaEntrada.numero}`, { buttonClose: true })

        $(modal.element).dialog(modal.config).dialog('open')


    }

    visualizarNotaDetalhada(e) {
        e.preventDefault()

        let data = utils.JsonUtil.toParse($(e.currentTarget).closest('.row-item-list').attr('data-item'))

        let urlAux = 'edicao'

        if (['lancada', 'cancelada', 'finalizada'].indexOf(data.status) !== -1)
            urlAux = 'visualizacao'

        window.location.hash = `#compras/nota-fiscal/${urlAux}`

        _cache.notaFiscal = data

        new NotaFiscalEntradaView(data)



    }

    renderNotasFiscais(data = {}, options = {}) {

        _.assign(options, { isDesktopMobile: true, closeLoader: true })




        utils.UnderscoreUtil._template('#template-list-entrada-nota-lancadas', { notas: data }, '#inner-list-notas-entradas-lancadas', options)



        if (data.length > 0)
            $('#block-list-compra .carregar-mais').attr({ 'disabled': false })

        $('#block-list-compra').find('#inner-list-notas-entradas-lancadas-desktop, #inner-list-notas-entradas-lancadas-mobile').find('.status-print').each((i, item) => {

            let status = utils.StringUtil.trim($(item).text())

            let block = $(item).parents('.row-item-list')



            if (['cancelada', 'finalizada'].indexOf(status) !== -1)
                $(block).find('.btn-cancelar-nota').hide()

            if (['cancelada', 'finalizada', 'lancada'].indexOf(status) !== -1)
                $(block).find('.btn-detalhar-nota').hide()

            if (['lancada', 'cancelada'].indexOf(status) === -1)
                $(block).find('.btn-estornar-nota').hide()

            if (['lancada'].indexOf(status) !== -1)
                $(block).find('.btn-marcar-como-finalizada').show()
            else
                $(block).find('.btn-marcar-como-finalizada').hide()


        })
    }


    getFormPesquisaCache() {
        let form = {}

        if (utils.localStorageUtil.isStorageItem('ultima_pesquisa_notas_fiscais_cadastro'))
            form = utils.localStorageUtil.getStorage('ultima_pesquisa_notas_fiscais_cadastro')

        return form
    }

    carregarListaNotasFiscaisCompra(options) {

        let form = this.getFormPesquisaCache()

        let overlay = $(`#block-list-compra #overlay-painel-list-cadastro`).find('.overlay')

        overlay.show()

        if (Object.getOwnPropertyNames(form).length == 0)
            form = { status: 'pendente' }

        this._model.findAllNotas(form)
            .then((r) => {
                this.renderNotasFiscais(r, options)
            }).catch((err) => {
                utils.MessageUtil.error(err)
            }).finally(() => {
                overlay.hide()
            })
    }


    renderFormPesquisa() {

        let form = this.getFormPesquisaCache()


        utils.UnderscoreUtil._template("#template-form-pesquisa-entrada-nota", { form: form }, '#inner-form-pesquisa-nota-entrada')




        utils.ApiUtil.listFabricas().then((fabricas) => {
            let select = $('#block-list-compra #form-pesquisa').find('#pesquisa-fabricaId')
            select.append('<option value="">Selecione...</option>')
            fabricas.forEach((item) => {
                select.append(`<option value="${item.pessoaId}" ${item.pessoaId == form.fabricaId ? 'selected' : ''} >${item.nomeFantasia} - ${item.razaoSocial}</option>`)
            })
        })

        utils.ApiUtil.statusNotasFiscaisEntrada().then((status) => {
            let select = $('#block-list-compra #form-pesquisa').find('#pesquisa-status')

            select.append(`<option value="">Selecione</option>`)
            select.append(`<option value="all">Todos</option>`)

            status.forEach((item) => {

                select.append(`<option value="${item.value}" ${item.value == form.status ? 'selected' : ''} >${item.text}</option>`)
            })
        })


    }


    renderTela() {

        try {

            //this.breadCrumbs()

            utils.HtmlUtil.loader()

            //Template layout.pug
            utils.UnderscoreUtil._template('#template-compras-nota-fiscal', {}, '#inner-content')

            //template compras.pug
            utils.UnderscoreUtil._template('#template-children-nota-fiscal-entrada', {}, '#inner-content-children')

            //template notafiscal.pug
            utils.UnderscoreUtil._template('#template-children-nota-fiscal-list', {}, '#inner-content-children-nota-or-inventario')

            utils.UnderscoreUtil._template('#template-list-entrada-nota-lancadas-parent', {}, '#inner-list-notas-entradas-lancadas-parent')

            this.renderFormPesquisa()

        } catch (err) {
            utils.MessageUtil.error(err)
        }
    }


    render() {
        try {

            utils.HtmlUtil.loader()

            this._bread.show()

            this.renderTela()
            this.carregarListaNotasFiscaisCompra()


        } catch (err) {
            utils.MessageUtil.message(err, 'danger')
        }
        return this
    }

}

class NotaFiscalEntradaView extends Backbone.View {

    constructor(nota) {
        super()

        this._bread = new utils.BreadCrumb()

        this.breadCrumbs()

        this._pathUrl = Backbone.history.getFragment()


        this._model = new NotaFiscalEntradaModel()

        this.$el = $('body')

        this.overrideEvents()



        _cache.notaFiscal = nota

        _cache.produtosLancados = []

        this.render(nota)
    }


    breadCrumbs() {
        //this._bread.add('inicio', '#home')
        //  .add('Tipos de Unidades', '#cadastro-de-tipos-unidades')
    }

    reset() {
        this.$el.off('click', '#block-list-compra #btn-novo-cadastro')
        this.$el.off('click', '#block-form-compra #form-cadastro #save')
        this.$el.off("click", "#block-form-compra #form-cadastro #adicionar-produto")
        this.$el.off("click", "#block-form-compra #form-cadastro #cancelar-lancamento")
        this.$el.off("blur", "#block-form-compra #form-cadastro #lancamento-quantidade")
        this.$el.off("click", "#block-form-compra #form-cadastro #btn-lancar-nota")
        this.$el.off("click", "#block-form-compra #form-cadastro .remover-produto-lancado")
        this.$el.off("change", "#block-form-compra #form-cadastro #selecao-fornecedor")
        this.$el.off("click", "#block-form-compra #form-cadastro #btn-cancelar-nota")
        this.$el.off('change', '#block-form-compra #form-cadastro #lancamento-is-bonificado')
        this.$el.off('click', '#block-form-compra #btn-novo-cadastro')
        this.$el.off('click', '#block-form-compra #form-cadastro #btn-finalizar-nota')
        this.$el.off('change', '#block-form-compra #form-cadastro #lancamento-tipo-unidade')
        this.$el.off('blur', '#block-form-compra #form-cadastro #lancamento-custo')


    }


    overrideEvents() {
        this.reset()

        this.delegateEvents({
            "click #block-list-compra #btn-novo-cadastro": "renderCadastro",
            'click #block-form-compra #btn-novo-cadastro': 'novoCadastro',
            "click #block-form-compra #form-cadastro #save": "save",
            "click #block-form-compra #form-cadastro #btn-cancelar-nota": "cancelarNotaFiscal",
            "click #block-form-compra #form-cadastro #btn-lancar-nota": "lancarNota",
            "click #block-form-compra #form-cadastro #adicionar-produto": "adicionarProduto",
            "click #block-form-compra #form-cadastro #cancelar-lancamento": "cancelarLancamento",
            "blur #block-form-compra #form-cadastro #lancamento-quantidade": "calcularSubtotalItem",
            "click #block-form-compra #form-cadastro .remover-produto-lancado": 'removerProdutoLancado',
            "change #block-form-compra #form-cadastro #selecao-fornecedor": 'selecionarFornecedor',
            "change #block-form-compra #form-cadastro #lancamento-is-bonificado": "calcularSubtotalItem",
            'click #block-form-compra #form-cadastro #btn-finalizar-nota': 'finalizarNotaEntrada',
            'change #block-form-compra #form-cadastro #lancamento-tipo-unidade': 'calcularSubtotalItem',
            'blur #block-form-compra #form-cadastro #lancamento-custo': 'calcularSubtotalItem',
        })

    }


    novoCadastro(e) {
        e.preventDefault()

        new NotaFiscalEntradaView()

    }

    calcularTotalNota() {
        let totalItens = 0
        let totalPedido = 0

        _cache.produtosLancados.forEach(item => {
            totalItens = utils.NumberUtil.sum(totalItens, item.quantidade)
            totalPedido = utils.NumberUtil.sum(totalPedido, item.total)
        })

        $('body').find('#block-form-compra .total-itens-quantidade').text(totalItens)
        $('body').find('#block-form-compra .total-itens-valor').text(`R$ ${utils.NumberUtil.numberFormat(totalPedido, 2)}`)
    }

    calcularSubtotalItem(e) {

        let isBonificado = $('body').find('#block-form-compra #lancamento-is-bonificado').val()
        let item = utils.JsonUtil.toParse($('body').find('#block-form-compra #form-lancamento-produto-entrada').attr('data-item'))

        if (isBonificado == 'true')
            $('body').find('#block-form-compra #lancamento-custo').val(0.00)
        else if ($('body').find('#block-form-compra #lancamento-custo').val() == '0.00')
            $('body').find('#block-form-compra #lancamento-custo').val(item.custo)


        let quantidade = parseInt($('body').find('#block-form-compra #lancamento-quantidade').val())
        let custo = parseFloat($('body').find('#block-form-compra #lancamento-custo').val())
        let tipoUnidadePedido = $('body').find('#block-form-compra #lancamento-tipo-unidade').val()

        let subtotalBlock = $('body').find('#block-form-compra #lancamento-subtotal')

        if (tipoUnidadePedido == 'UNITARIO')
            $(subtotalBlock).val(utils.NumberUtil.numberFormat(utils.NumberUtil.multiplicacao(utils.NumberUtil.divisao(custo, item.fracao), quantidade), 2))
        else
            $(subtotalBlock).val(utils.NumberUtil.numberFormat(utils.NumberUtil.multiplicacao(custo, quantidade), 2))

    }

    removerProdutoLancado(e) {
        e.preventDefault()

        if (_cache.produtosLancados.length == 0)
            return false

        let tr = $(e.currentTarget).closest('.row-item-list')


        let produtoSelecionado = utils.JsonUtil.toParse(tr.attr('data-item'))




        let run = async () => {

            _cache.produtosLancados = _.reject(_cache.produtosLancados, (item) => { return item.produtoId === produtoSelecionado.produtoId && item.id === produtoSelecionado.id })

            if (_cache.produtosLancados.length == 0) {
                $("#block-form-compra #inner-produtos-lancados").empty()
            } else {
                tr.remove()
                this.calcularTotalNota()
            }


            if (_cache.produtosLancados.length == 0) {
                $('#block-form-compra #save').hide()
                $('#block-form-compra #btn-lancar-nota').hide()
            }

            let [err, ok] = await utils.PromiseUtil.to(this._model.removeItem(produtoSelecionado))
            if (err)
                return await utils.MessageUtil.error(err)

            await this.save(e, { noMessage: true })

        }

        let options = {
            buttons: {
                'Sim': (e) => {
                    run()
                    utils.MessageUtil.closeButton(e)
                },
                'Não': (e) => {
                    utils.MessageUtil.closeButton(e)
                }
            }
        }


        utils.MessageUtil.message(`Deseja remover o item: <strong>"${utils.ObjectUtil.getValueProperty(produtoSelecionado, 'produto.descricao')}"</strong> da Nota de Entrada?`, 'warning', options)

    }

    async adicionarProduto(e, produtos = []) {
        if (e)
            e.preventDefault()




        if (produtos.length > 0) {
            _cache.produtosLancados = produtos

            utils.UnderscoreUtil._template('#template-nota-fiscal-produtos-lancados', { lancamentos: _cache.produtosLancados }, '#inner-produtos-lancados')
            $('body').find('#block-form-compra #inner-lancamento-produto').slideUp('slow').html('')

            this.calcularTotalNota()
        } else {

            let produto = utils.FormUtil.mapObject('#block-form-compra #form-lancamento-produto-entrada')


            if (produto.formObject.lancamento.quantidade <= 0 || produto.formObject.lancamento.custo <= 0) {

                let isErr = true

                if (produto.formObject.lancamento.isBonificado == 'true' && produto.formObject.lancamento.quantidade > 0)
                    isErr = false
                else
                    return utils.MessageUtil.error('É necessário informar quantidade para produtos bonificados!')


                if (isErr == true)
                    return utils.MessageUtil.error('É necessário informar quantidade e custo para lançamento do item!')

            }


            let itemData = produto.formObject.lancamento

            let itensJaLancados = _.clone(_cache.produtosLancados).filter(item => {
                return itemData.produtoId == item.produtoId && utils.StringUtil.stringToBoolean(itemData.isBonificado) == utils.StringUtil.stringToBoolean(item.isBonificado)
            })

            let run = async () => {
                let obj = {
                    custo: itemData.custo,
                    quantidade: itemData.quantidade,
                    produto: itemData.produto,
                    isBonificado: itemData.isBonificado,
                    produtoId: itemData.produtoId,
                    notaEntradaId: _cache.notaFiscal.id,
                    chaveAcessoNF: itemData.chaveAcessoNF,
                    tipoUnidade: itemData.tipoUnidade,
                    total: itemData.subtotal,
                    isNF: itemData.isNF
                }


                let item = await this._model.saveItem(obj).catch((err) => { return utils.MessageUtil.error(err) })

                if (item === undefined)
                    return

                obj.id = item.id

                _cache.produtosLancados.push(obj)




                if (_cache.produtosLancados.length > 0) {
                    $('#block-form-compra #save').show()
                    $('#block-form-compra #btn-lancar-nota').show()
                }

                utils.UnderscoreUtil._template('#template-nota-fiscal-produtos-lancados', { lancamentos: _cache.produtosLancados }, '#inner-produtos-lancados')
                $('body').find('#block-form-compra #inner-lancamento-produto').slideUp('slow').html('')

                this.calcularTotalNota()

                await this.save(e, { noMessage: true })


            }


            if (itensJaLancados.length >= 1) {


                let options = {
                    buttons: {
                        'Sim': (e) => {
                            run()
                            utils.MessageUtil.closeButton(e)
                        },
                        'Não': (e) => {
                            utils.MessageUtil.closeButton(e)
                            return
                        }
                    }
                }

                let msg = `Já existe um lançamento anterior deste mesmo produto, lançamento ${itemData.isBonificado == true ? 'como bonificado' : 'como normal'} <br />Deseja continuar o lançamento do item?`

                utils.MessageUtil.message(msg, 'warning', options)

            } else {
                run()
            }

        }


    }

    cancelarLancamento(e) {
        e.preventDefault()
        $('body').find('#block-form-compra #inner-lancamento-produto').slideUp('slow').html('')
    }


    cancelarNotaFiscal(e) {


        e.preventDefault()

        let notaFiscal = utils.FormUtil.mapObject('#block-form-compra #form-cadastro')

        this._model.cancelarNotaView(notaFiscal.formObject)


    }


    finalizarNotaEntrada(e) {
        e.preventDefault()

        this.lancarNota(e, true)

    }

    lancarNota(e, isFinalizada = false) {
        e.preventDefault()

        if (isFinalizada)
            $("#block-form-compra #form-cadastro").find('input[name="status"]').val('finalizada')
        else
            $("#block-form-compra #form-cadastro").find('input[name="status"]').val('lancada')


        this._model.saveNotaView($('#block-form-compra #form-cadastro'), { isForm: true, isFinalizadada: isFinalizada })


    }

    save(e, options = {}) {
        e.preventDefault()

        $("#block-form-compra #form-cadastro").find('input[name="status"]').val('pendente')

        let notaEntrada = this._model.model($('#block-form-compra #form-cadastro')).formObject



        this._model.save(notaEntrada, false).then((r) => {

            if (options.noMessage == true)
                return true

            utils.MessageUtil.message(r.message, 'info', {
                buttons: {
                    'Fechar': (event) => {
                        utils.MessageUtil.closeButton(event)
                    }
                }
            })
        }).catch((err) => {
            utils.MessageUtil.error(err)
        })



    }




    selecionarFornecedor(e) {
        e.preventDefault()

        let select = $(e.currentTarget)

        if (select.val() == '')
            return

        let notaEntrada = this._model.model($('#block-form-compra #form-cadastro')).formObject

        notaEntrada.status = 'pendente'
        notaEntrada.fabricaId = select.val()


        this._model.save(notaEntrada, false).then((data = {}) => {
            this.renderCadastro(data.data)
        }).catch((err) => {
            this.renderSelecaoFornecedor()
            utils.MessageUtil.error(err)
        })
    }

    renderSelecaoFornecedor(e, data = {}) {

        let overlay = $('#block-form-compra #selecao-fornecedor').closest('.form-group').find('.overlay')

        overlay.show()

        utils.ApiUtil.listFabricas().then((fabricas = []) => {

            let html = ''

            if (!data.fabricaId)
                html = '<option value="">Selecione</option>'

            fabricas.forEach((item) => {
                if (data.fabricaId) {
                    if (data.fabricaId == item.pessoaId)
                        html = `<option selected value="${item.pessoaId}">${item.razaoSocial} >> ${item.nomeFantasia}</option>`
                } else {
                    html += `<option value="${item.pessoaId}">${item.razaoSocial} >> ${item.nomeFantasia}</option>`
                }
            })

            $('#block-form-compra #selecao-fornecedor').html(html)

            if (data.fabricaId) {
                $('#block-form-compra #selecao-fornecedor').attr({ 'disabled': 'disabled', 'readonly': 'readonly' })
            } else {
                utils.JqueryUtil.initializeComponentesJquery()
            }

            overlay.show().hide()
        }).catch((err) => {
            utils.MessageUtil.error(err)
        })
    }

    renderAutoCompleteCadastro(e, data = {}) {

        utils.UnderscoreUtil._template('#template-nota-fiscal-lancamento-produto-autocomplete', {}, '#inner-produto-autocomplete')

        utils.AutoCompleteUtil.AutoComplete({
            type: 'produto',
            bloco: '#block-form-compra #bloco-autocomplete-produto-nota-fiscal-entrada',
            input: 'input[name="produto"]',
            isClearValue: true,
            fabricaId: data.fabricaId,

            callback: (item) => {

                $('body').find('#block-form-compra #inner-lancamento-produto').slideUp('slow').html('')

                utils.UnderscoreUtil._template('#template-nota-fiscal-lancamento-produto', { produto: item.data }, '#inner-lancamento-produto')

                $('body').find('#block-form-compra #inner-lancamento-produto').slideDown('slow')

                utils.MaskInputUtil.mask()
            }

        })
    }



    renderCadastro(data = {}) {

        try {

            this.breadCrumbs()

            utils.HtmlUtil.loader()



            if (data.id === undefined)
                this._bread.add('Nova Nota Fiscal').show()
            else
                this._bread.add(`Edição de Nota Fiscal ${data.id}`).show()


            //Template layout.pug
            utils.UnderscoreUtil._template('#template-compras-nota-fiscal', {}, '#inner-content')

            //template compras.pug
            utils.UnderscoreUtil._template('#template-children-nota-fiscal-entrada', {}, '#inner-content-children')

            //tempalte notafiscal.pug
            utils.UnderscoreUtil._template('#template-children-nota-fiscal-lancamento', {}, '#inner-content-children-nota-or-inventario')

            //template nova-nota.pug
            utils.UnderscoreUtil._template('#template-nota-fiscal-lancamento-form-principal', {}, '#inner-content-children-nota-or-inventario')

            utils.UnderscoreUtil._template('#template-nota-fiscal-lancamento-cabecalho', { form: data }, '#inner-cabecalho-nota')


            this.renderSelecaoFornecedor(undefined, data)

            if (data.id)
                _cache.notaFiscal = data


            if (data.fabricaId) {


                this.renderAutoCompleteCadastro(undefined, data)

                if (data.itens && (data.itens.length > 0)) {

                    this.adicionarProduto(null, data.itens)


                    if (['lancada', 'cancelada', 'finalizada'].indexOf(data.status) === -1) {


                        $('#block-form-compra #save').show()
                        $('#block-form-compra #btn-lancar-nota').show()

                    } else {

                        $('#block-form-compra #form-cadastro #bloco-btn-lancamento').find('button').each((i, item) => { $(item).hide() })

                        if (data.status == 'lancada')
                            $('#block-form-compra #form-cadastro #btn-finalizar-nota').show().attr({ 'disabled': false })

                        $('#block-form-compra #form-cadastro #inner-produto-autocomplete').html('')
                        $('#block-form-compra #form-cadastro .form-control').each((i, item) => { $(item).attr('disabled', true) })
                        $('#block-form-compra #form-cadastro .remover-produto-lancado').each((i, item) => { $(item).remove() })
                    }
                }


                $('#block-form-compra #form-cadastro')
                    .find('select[name="isNF"] option')
                    .filter((i, e) => { return $(e).val() == `${data.isNF}` })
                    .prop("selected", true)
                    .change()



            }


        } catch (err) {
            utils.MessageUtil.error(err)
        }
    }


    render(data) {
        try {

            utils.HtmlUtil.loader()

            this._bread.show()

            this.renderCadastro(data)

        } catch (err) {
            utils.MessageUtil.message(err, 'danger')
        }
        return this
    }

}

module.exports = {
    NotaFiscalEntradaView: () => { return new NotaFiscalEntradaView() },
    NotaFiscalEntradaListView: () => { return new NotaFiscalEntradaListView() }
}




