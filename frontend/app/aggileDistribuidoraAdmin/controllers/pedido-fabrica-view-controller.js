let utils = require('../../../helpers/utils-admin')


let _cache = {
    produtosLancados: [],
    pedido: {}

}

let paginator = utils.PaginatorUtil.paginator()

class PedidoFabricaModel extends utils.BackboneModelUtil {

    constructor() {
        super()
    }

    defaults() {

    }


    model(form) {
        return utils.FormUtil.mapObject(form)
    }

    async findAllPedidos(data) {

        _.assign(data, paginator)

        this.url = utils.UrlUtil.url(`admin/pedidos-fabrica/listar-pedidos`)

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

    async listProdutosFabrica(fabricaId) {
        this.url = utils.UrlUtil.url(`admin/produtos/list`)

        let send = { type: 'POST', data: { fabricaId: fabricaId } }

        return await this.fetch(send)
    }

    async save(data, isForm = true) {
        this.url = utils.UrlUtil.url(`admin/pedidos-fabrica/save`)

        let send = { data: isForm ? this.model(data).formObject : data, type: 'POST' }

        return await this.fetch(send)
    }

    async cancelarPedido(data) {
        this.url = utils.UrlUtil.url(`admin/pedidos-fabrica/cancelar-pedido`)

        let send = { data: data, type: 'POST' }

        return await this.fetch(send)
    }

    async saveItem(data) {
        this.url = utils.UrlUtil.url(`admin/pedidos-fabrica/save-item`)

        let send = { data: data, type: 'POST' }

        return await this.fetch(send)
    }

    async removeItem(item = {}, numero = undefined) {

        this.url = utils.UrlUtil.url(`admin/pedidos-fabrica/remove-item`)

        let send = {}


        if (numero)
            send = { data: { numero: numero, removeAll: true }, type: 'POST' }
        else
            send = { data: { id: item.id, pedidoFabricaId: item.pedidoFabricaId, produtoId: item.produtoId }, type: 'POST' }

        return await this.fetch(send)
    }


    savePedidoView = async (data, options = {}) => {
        let run = () => {



            this.save(data, options.isForm).then((r) => {

                utils.MessageUtil.message(r.message, 'info', {
                    buttons: {
                        'Fechar': (event) => {
                            utils.MessageUtil.closeButton(event)
                            if (options.element)
                                $(options.element).remove()
                            else
                                utils.UrlUtil.loadUrlBackbone('pedidos/fabrica/pesquisa')

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


        //let msg = ''

        /*
        if (options.isEntregue)
            msg = 'Deseja marcar o pedido como Entregue?<br />Após este procedimento, não será mais possível cancelar o pedido!'
        else if ('pedidoIsConsignado' in options) {
            data.pedidoIsConsignado = options.pedidoIsConsignado
            msg = `Deseja ${options.pedidoIsConsignado == false ? 'definir o pedido como NORMAL' : 'alterar o pedido para CONSIGNADO'}?`
        } else*/
        let msg = 'Deseja finalizar o pedido?<br />Após o lançamento, será lançada uma nota com status pendente do pedido!'


        utils.MessageUtil.message(msg, 'warning', question)

    }


    cancelarPedidoView = (pedido, self, isEstorno = false) => {

        let run = () => {



            this.cancelarPedido({ id: pedido.id, isEstorno: isEstorno }).then((r) => {
                utils.MessageUtil.message(r.message, 'info', {
                    buttons: {
                        'Fechar': (e) => {
                            if (self)
                                self.pesquisarPedidos()
                            else
                                utils.UrlUtil.loadUrlBackbone('pedidos/fabrica/pesquisa')

                            utils.MessageUtil.closeButton(e)
                        }
                    }
                })
            }).catch((err) => {

                utils.MessageUtil.error(err)
            })
        }


        if (['lancado', 'pendente', 'cancelado'].indexOf(pedido.status) !== -1) {


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

            if (pedido.status == 'lancado' && isEstorno == true)
                msg = 'Deseja estonar o pedido?<br />As contas de recebimento, movimentação e estoques irão ser atualizados!'
            else if (pedido.status == 'cancelado' && isEstorno == true)
                msg = 'Deseja voltar o pedido para pendente?'
            else if (['lancado'].indexOf(pedido.status) !== -1)
                msg = 'Deseja cancelar o pedido?<br />As contas de recebimento, movimentação e estoques irão ser atualizados!'
            else
                msg = 'Deseja realmente cancelar este pedido?'

            utils.MessageUtil.message(msg, 'warning', options)

        }


    }

}



class PedidoFabricaListView extends Backbone.View {
    constructor(options = {}) {
        super()

        this._bread = new utils.BreadCrumb()

        paginator = utils.PaginatorUtil.paginator()

        utils.UrlUtil.setUrlHash('pedidos/fabrica/pesquisa')


        this._model = new PedidoFabricaModel()

        this.$el = $('body')

        this.overrideEvents()

        this.render()
    }


    reset() {
        this.$el.off('click', '#block-list-pedido-fabrica .btn-visualizar-pedido')
        this.$el.off("click", "#block-list-pedido-fabrica .btn-cancelar-pedido")
        this.$el.off("click", "#block-list-pedido-fabrica .pesquisar")
        this.$el.off("click", "#block-list-pedido-fabrica .limpar-pesquisa")
        this.$el.off('click', '#block-list-pedido-fabrica .btn-estornar-pedido')
        this.$el.off('click', '#block-list-pedido-fabrica .carregar-mais')
        this.$el.off('click', '#block-list-pedido-fabrica .btn-visualizar-pedido-info')
        this.$el.off('click', '#block-list-pedido-fabrica .btn-marcar-como-entregue')
        //this.$el.off('click', '#block-list-pedido-fabrica .btn-is-pedido-consignado-or-normal-pedido')


    }


    overrideEvents() {
        this.reset()

        this.delegateEvents({
            "click #block-list-pedido-fabrica .btn-visualizar-pedido": "visualizarPedidoDetalhado",
            "click #block-list-pedido-fabrica .btn-cancelar-pedido": "cancelarPedidoView",
            "click #block-list-pedido-fabrica .btn-estornar-pedido": "estornarPedidoView",
            'click #block-list-pedido-fabrica .pesquisar': 'pesquisarPedidos',
            'click #block-list-pedido-fabrica .limpar-pesquisa': 'limparPesquisaPedidos',
            'click #block-list-pedido-fabrica .carregar-mais': 'carregarMaisItensCadastro',
            'click #block-list-pedido-fabrica .btn-visualizar-pedido-info': 'visualizacaoRapida',
            'click #block-list-pedido-fabrica .btn-marcar-como-entregue': 'marcarComoEntregue',
            //'click #block-list-pedido-fabrica .btn-is-pedido-consignado-or-normal-pedido': 'transformarPedidoConsignadoOrNormal'
        })



    }
    /*
    async transformarPedidoConsignadoOrNormal(e) {
        e.preventDefault()

        let pedido = utils.JsonUtil.toParse($(e.currentTarget).closest('.row-item-list').attr('data-item'))

        let pedidoIsConsignado = pedido.consignado == true ? false : true

        await this._model.savePedidoView(pedido, { isForm: false, pedidoIsConsignado: pedidoIsConsignado, element: $(e.currentTarget).closest('.row-item-list') })
    }*/


    async marcarComoEntregue(e) {
        e.preventDefault()

        return true

        let pedido = utils.JsonUtil.toParse($(e.currentTarget).closest('.row-item-list').attr('data-item'))

        pedido.status = 'entregue'

        await this._model.savePedidoView(pedido, { isForm: false, isEntregue: true, element: $(e.currentTarget).closest('.row-item-list') })
    }


    limparPesquisaPedidos(e) {
        e.preventDefault()

        utils.localStorageUtil.removeStorage('ultima_pesquisa_pedidos_fabrica_cadastro')

        this.renderFormPesquisa()
    }

    estornarPedidoView(e) {
        e.preventDefault()

        let pedido = utils.JsonUtil.toParse($(e.currentTarget).closest('.row-item-list').attr('data-item'))


        this._model.cancelarPedidoView(pedido, this, true)
    }

    async visualizacaoRapida(e) {
        e.preventDefault()



        let pedido = utils.JsonUtil.toParse($(e.currentTarget).closest('.row-item-list').attr('data-item'))

        let html = await utils.UnderscoreUtil._template('#template-list-pedidos-info-pedido-fabrica-lancado', { form: pedido, lancamentos: pedido.itens })


        let modal = await utils.ModalUtil.modalVTT(html, `Visualização Pedido nº ${pedido.id}`, { buttonClose: true })

        $(modal.element).dialog(modal.config).dialog('open')


    }





    cancelarPedidoView(e) {
        e.preventDefault()

        let pedido = utils.JsonUtil.toParse($(e.currentTarget).closest('.row-item-list').attr('data-item'))


        this._model.cancelarPedidoView(pedido, this)

    }


    visualizarPedidoDetalhado(e) {
        e.preventDefault()

        let data = utils.JsonUtil.toParse($(e.currentTarget).closest('.row-item-list').attr('data-item'))

        utils.UrlUtil.setUrlHash('pedidos/fabrica/lancamento')

        _cache.pedido = data

        new PedidoFabricaView(data)

    }


    renderFabricaFormPesquisa(form) {
        utils.UnderscoreUtil._template('#template-form-pesquisa-pedido-autocomplete-fabrica', {}, '#inner-fabrica-selecao-pesquisa')


        utils.ApiUtil.listFabricas().then((fabricas) => {
            let select = $('#block-list-pedido-fabrica #inner-fabrica-selecao-pesquisa').find('#pesquisa-fabrica-id')
            select.append('<option value="">Selecione...</option>')
            fabricas.forEach((item) => {
                select.append(`<option value="${item.pessoaId}" ${item.pessoaId == form.fabricaId ? 'selected' : ''} >${item.nomeFantasia} - ${item.razaoSocial}</option>`)
            })
        })


    }

    getFormPesquisaCache() {
        let form = {}

        if (utils.localStorageUtil.isStorageItem('ultima_pesquisa_pedidos_fabrica_cadastro'))
            form = utils.localStorageUtil.getStorage('ultima_pesquisa_pedidos_fabrica_cadastro')

        return form
    }


    renderFormPesquisa() {

        let form = this.getFormPesquisaCache()


        utils.UnderscoreUtil._template("#template-form-pesquisa-pedido-fabrica", { form: form }, '#inner-form-pesquisa-pedido-fabrica')


        $.when(utils.EstadoMunicipioUtil.municipioSelectBox(
            {
                municipioElement: '#block-list-pedido-fabrica #pesquisa-municipio',
                municipio: form.municipio
            }
        ))

        this.renderFabricaFormPesquisa(form)

        let select = $('#block-list-pedido-fabrica #form-pesquisa').find('#pesquisa-status')

        let selectConsignado = $('#block-list-pedido-fabrica #form-pesquisa').find('#pesquisa-consignado')

        utils.ApiUtil.listBooleanSimNao().forEach(item => {
            selectConsignado.append(`<option value="${item.value}" ${item.value == form.consignado || item.default === true ? 'selected' : ''} >${item.text}</option>`)
        })


        utils.ApiUtil.statusPedidoFabrica().then((status) => {

            select.append(`<option value="">Selecione</option>`)
            select.append(`<option value="all">Todos</option>`)

            status.forEach((item) => {

                select.append(`<option value="${item.value}" ${item.value == form.status ? 'selected' : ''} >${item.text}</option>`)
            })
        })


    }

    carregarMaisItensCadastro(e) {
        e.preventDefault()

        $('#block-list-pedido-fabrica .carregar-mais').attr({ 'disabled': true })

        this.carregarListaPedidos({ append: true })
    }


    pesquisarPedidos(e) {
        if (e)
            e.preventDefault()

        paginator = utils.PaginatorUtil.paginator()

        let form = utils.FormUtil.mapObject('#block-list-pedido-fabrica #form-pesquisa')

        utils.localStorageUtil.setStorage('ultima_pesquisa_pedidos_fabrica_cadastro', form.formObject.pesquisa)



        this.carregarListaPedidos()

    }

    carregarListaPedidos(options) {

        let form = this.getFormPesquisaCache()

        let overlay = $(`#block-list-pedido-fabrica #overlay-painel-list-cadastro`).find('.overlay')

        overlay.show()

        if (Object.getOwnPropertyNames(form).length == 0)
            form = { status: 'pendente' }

        this._model.findAllPedidos(form, options)
            .then((r) => {
                this.renderPedidos(r, options)
            }).catch((err) => {
                utils.MessageUtil.error(err)
            }).finally(() => { overlay.hide() })
    }




    renderTela() {

        try {

            //this.breadCrumbs()

            utils.HtmlUtil.loader()


            //Template layout.pug
            utils.UnderscoreUtil._template('#template-pedidos-fabrica', {}, '#inner-content')

            //template compras.pug
            utils.UnderscoreUtil._template('#template-children-pedido-fabrica', {}, '#inner-content-children')

            //tempalte notafiscal.pug
            utils.UnderscoreUtil._template('#template-children-pedido-fabrica-list', {}, '#inner-content-children-pedido-fabrica')


            utils.UnderscoreUtil._template('#template-list-pedidos-fabrica-lancados-parent', {}, '#inner-pedidos-lancados-parent')

            //
            this.renderFormPesquisa()
        } catch (err) {
            utils.MessageUtil.error(err)
        }
    }

    renderPedidos(data = {}, options = {}) {

        _.assign(options, { isDesktopMobile: true, closeLoader: true })


        utils.UnderscoreUtil._template('#template-list-pedidos-fabrica-lancados', { pedidos: data }, '#inner-pedidos-lancados', options)

        if (data.length > 0)
            $('#block-list-pedido-fabrica .carregar-mais').attr({ 'disabled': false })

        $('#block-list-pedido-fabrica').find('#inner-pedidos-lancados-desktop, #inner-pedidos-lancados-mobile').find('.status-print').each((i, item) => {

            let status = $(item).text()

            let block = $(item).closest('.row-item-list')

            if (['cancelado', 'lancado'].indexOf(status) !== -1)
                $(block).find('.btn-cancelar-pedido').hide()


            if (['cancelado', 'entregue', 'lancado'].indexOf(status) !== -1)
                $(block).find('.btn-visualizar-pedido').hide()

            if (['lancado', 'cancelado'].indexOf(status) !== -1)
                $(block).find('.btn-estornar-pedido').hide()

            //if (['lancado'].indexOf(status) !== -1)
            //    $(block).find('.btn-marcar-como-entregue').show()
            //else
            $(block).find('.btn-marcar-como-entregue').hide()

        })
    }


    render() {
        try {

            utils.HtmlUtil.loader()

            this._bread.show()



            this.renderTela()


            this.carregarListaPedidos()




            //utils.UnderscoreUtil._template('#template-paginator', {paginator : {first : 1, values: [2,3,4], end: 10}}, '#inner-paginator')

        } catch (err) {
            utils.MessageUtil.message(err, 'danger')
        }
        return this
    }

}

class PedidoFabricaView extends Backbone.View {

    constructor(pedido = {}) {
        super()


        this._bread = new utils.BreadCrumb()

        this.breadCrumbs()


        this._model = new PedidoFabricaModel()

        this.$el = $('body')

        this.overrideEvents()

        _cache.pedido = pedido

        _cache.produtosLancados = []


        this.render(pedido)
    }


    breadCrumbs() {
        //this._bread.add('inicio', '#home')
        //  .add('Tipos de Unidades', '#cadastro-de-tipos-unidades')
    }

    reset() {
        this.$el.off('click', '#block-list-pedido-fabrica #btn-novo-cadastro')
        this.$el.off('click', '#block-form-pedido-fabrica #btn-novo-cadastro')
        this.$el.off('click', '#block-form-pedido-fabrica #form-cadastro #save')
        this.$el.off("click", "#block-form-pedido-fabrica #form-cadastro #adicionar-produto")
        this.$el.off("click", "#block-form-pedido-fabrica #form-cadastro #btn-lancar-pedido")
        this.$el.off("click", "#block-form-pedido-fabrica #form-cadastro .remover-produto-lancado")
        this.$el.off("click", "#block-form-pedido-fabrica #form-cadastro #btn-cancelar-pedido")
        this.$el.off('click', '#block-form-pedido-fabrica #form-cadastro #selecionar-outra-fabrica')
        this.$el.off("blur", "#block-form-pedido-fabrica #form-cadastro #lancamento-quantidade")
        this.$el.off("blur", "#block-form-pedido-fabrica #form-cadastro #lancamento-custo")
        this.$el.off('change', '#block-form-pedido-fabrica #form-cadastro #lancamento-tipo-unidade')
        this.$el.off('change', '#block-form-pedido-fabrica #form-cadastro #lancamento-is-bonificado')
        this.$el.off('click', '#block-form-pedido-fabrica #form-cadastro #btn-entregar-pedido')
        this.$el.off('click', '#block-form-pedido-fabrica #form-cadastro #cancelar-lancamento')
        this.$el.off('click', '#block-form-pedido-fabrica #form-cadastro #btn-print')
        this.$el.off('change', '#block-form-pedido-fabrica #form-cadastro #fabrica-selecao')

    }


    overrideEvents() {
        this.reset()

        this.delegateEvents({
            "click #block-list-pedido-fabrica #btn-novo-cadastro": "renderCadastro",
            "click #block-form-pedido-fabrica #btn-novo-cadastro": "novoCadastro",
            "click #block-form-pedido-fabrica #form-cadastro #save": "save",
            "click #block-form-pedido-fabrica #form-cadastro #btn-cancelar-pedido": "cancelarPedidoView",
            "click #block-form-pedido-fabrica #form-cadastro #btn-lancar-pedido": "lancarPedido",
            "click #block-form-pedido-fabrica #form-cadastro #adicionar-produto": "adicionarProduto",
            "click #block-form-pedido-fabrica #form-cadastro .remover-produto-lancado": 'removerProdutoLancado',
            'click #block-form-pedido-fabrica #form-cadastro #selecionar-outra-fabrica': 'selecionarOutraFabrica',
            'change #block-form-pedido-fabrica #form-cadastro #lancamento-tipo-unidade': 'calcularSubtotalItem',
            "change #block-form-pedido-fabrica #form-cadastro #lancamento-is-bonificado": "calcularSubtotalItem",
            "blur #block-form-pedido-fabrica #form-cadastro #lancamento-quantidade": "calcularSubtotalItem",
            "blur #block-form-pedido-fabrica #form-cadastro #lancamento-custo": "calcularSubtotalItem",
            'click #block-form-pedido-fabrica #form-cadastro #btn-entregar-pedido': 'lancarPedidoEntregue',
            'click #block-form-pedido-fabrica #form-cadastro #cancelar-lancamento': 'cancelarLancamentoProduto',
            'click #block-form-pedido-fabrica #form-cadastro #btn-print': 'printPDF',
            "change #block-form-pedido-fabrica #form-cadastro #fabrica-selecao": 'selecionarFornecedor',

        })

    }

    printPDF(e) {
        e.preventDefault()


        let $form = $('#block-form-pedido-fabrica #form-cadastro')

        let formMap = utils.FormUtil.mapObject($form)

        if (utils.ObjectUtil.getValueProperty(formMap, 'formObject.uuid'))
            utils.FormUtil.redirectBlank(`/reports/pedidos-fabrica/report-fabrica/${formMap.formObject.uuid}`)

    }

    novoCadastro(e) {
        e.preventDefault()

        new PedidoFabricaView()

    }


    cancelarLancamentoProduto(e) {
        e.preventDefault()


        $('body').find('#block-form-pedido-fabrica #inner-lancamento-produto').slideUp('slow').html('')
    }


    calcularSubtotalItem(e) {
        e.preventDefault()


        let isBonificado = $('body').find('#block-form-pedido-fabrica #lancamento-is-bonificado').val()
        let produto = utils.JsonUtil.toParse($('body').find('#block-form-pedido-fabrica #form-lancamento-produto-pedido').attr('data-item'))



        if (isBonificado == 'true')
            $('body').find('#block-form-pedido-fabrica #lancamento-custo').val('0.00')
        else if ($('body').find('#block-form-pedido-fabrica #lancamento-custo').val() == '0.00')
            $('body').find('#block-form-pedido-fabrica #lancamento-custo').val(produto.custo)


        let custo = parseFloat($('body').find('#block-form-pedido-fabrica #lancamento-custo').val())
        let tipoUnidadePedido = $('body').find('#block-form-pedido-fabrica #lancamento-tipo-unidade').val()
        let quantidade = $('body').find('#block-form-pedido-fabrica #lancamento-quantidade').val()


        let subtotalBlock = $('body').find('#block-form-pedido-fabrica #lancamento-subtotal')


        if (tipoUnidadePedido == 'UNITARIO')
            $(subtotalBlock).val(utils.NumberUtil.numberFormat(utils.NumberUtil.multiplicacao(utils.NumberUtil.divisao(custo, produto.fracao), quantidade), 2))
        else
            $(subtotalBlock).val(utils.NumberUtil.numberFormat(utils.NumberUtil.multiplicacao(custo, quantidade), 2))


    }

    calcularTotalPedido() {


        let totalItens = 0
        let totalPedido = 0
        let peso = 0

        try {
            _cache.produtosLancados.forEach((item) => {
                totalItens = utils.NumberUtil.sum(totalItens, item.quantidade)
                totalPedido = utils.NumberUtil.sum(totalPedido, item.total)
                peso = utils.NumberUtil.sum(peso, item.peso)
            })

        } catch (err) {

        }


        $('body').find('#block-form-pedido-fabrica .total-itens-quantidade').text(totalItens)
        $('body').find('#block-form-pedido-fabrica .total-itens-peso').text(`${peso} KG`)
        $('body').find('#block-form-pedido-fabrica .total-itens-valor').text(`R$ ${utils.NumberUtil.numberFormat(totalPedido, 2)}`)


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
                $("#inner-produtos-lancados").empty()
            } else {
                tr.remove()
                this.calcularTotalPedido()
            }

            if (_cache.produtosLancados.length == 0) {
                $('#block-form-pedido-fabrica #save').hide()
                $('#block-form-pedido-fabrica #btn-lancar-pedido').hide()

            }

            await this._model.removeItem(produtoSelecionado).catch((err) => { return utils.MessageUtil.error(err) })

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


        utils.MessageUtil.message(`Deseja remover o item: <strong>"${utils.ObjectUtil.getValueProperty(produtoSelecionado, 'produto.descricao')}"</strong> do pedido?`, 'warning', options)






    }

    async adicionarProduto(e, produtos = []) {
        try {
            if (e)
                e.preventDefault()

            let isSave = false


            if (produtos.length > 0) {
                _cache.produtosLancados = produtos
                $('#block-form-pedido-fabrica #save').show()
                $('#block-form-pedido-fabrica #btn-lancar-pedido').show()
                $('#block-form-pedido-fabrica #btn-cancelar-pedido').show()
            } else {

                let produto = utils.FormUtil.mapObject('#block-form-pedido-fabrica #form-lancamento-produto-pedido')



                if (produto.formObject.lancamento.quantidade <= 0 || produto.formObject.lancamento.custo <= 0) {
                    utils.MessageUtil.error('É necessário informar quantidade e custo para lançamento do item!')
                    return false
                }



                let itemData = produto.formObject.lancamento


                if (!_cache.pedido.id)
                    _cache.pedido = await this.savePedidoInicial()


                let obj = {
                    custo: itemData.custo,
                    quantidade: itemData.quantidade,
                    produto: itemData.produto,
                    produtoId: itemData.produtoId,
                    pedidoFabricaId: _cache.pedido.id,
                    isBonificado: itemData.isBonificado,
                    tipoUnidade: itemData.tipoUnidade,
                    total: itemData.subtotal,
                    isNF: itemData.isNF

                }

                let item = await this._model.saveItem(obj).catch((err) => { utils.MessageUtil.error(err) })

                if (item == undefined)
                    return



                obj.id = item.id
                obj.peso = item.peso


                _cache.produtosLancados.push(obj)




                if (_cache.produtosLancados.length > 0) {

                    $('#block-form-pedido-fabrica #save').show()
                    $('#block-form-pedido-fabrica #btn-lancar-pedido').show()
                    $('#block-form-pedido-fabrica #btn-cancelar-pedido').show()
                }

                isSave = true

            }


            utils.UnderscoreUtil._template('#template-pedido-fabrica-produtos-lancados', { lancamentos: _cache.produtosLancados }, '#inner-produtos-lancados')
            $('body').find('#block-form-pedido-fabrica #inner-lancamento-produto').slideUp('slow').html('')

            this.calcularTotalPedido()

            if (isSave)
                await this.save(e, { noMessage: true })

        } catch (err) {
            utils.MessageUtil.error(err)
        }


    }

    cancelarLancamento(e) {
        e.preventDefault()
        $('body').find('#block-form-pedido-fabrica #inner-lancamento-produto').slideUp('slow').html('')
    }

    cancelarPedidoView(e) {


        e.preventDefault()

        let pedido = utils.FormUtil.mapObject('#block-form-pedido-fabrica #form-cadastro')

        this._model.cancelarPedidoView(pedido.formObject)


    }

    lancarPedidoEntregue(e) {
        e.preventDefault()

        this.lancarPedido(e, true)

    }

    lancarPedido(e, isEntregue = false) {
        e.preventDefault()

        isEntregue = false

        //if (isEntregue)
        //    $("#block-form-pedido-fabrica #form-cadastro").find('input[name="status"]').val('entregue')
        //else
        $("#block-form-pedido-fabrica #form-cadastro").find('input[name="status"]').val('lancado')


        this._model.savePedidoView($('#block-form-pedido-fabrica #form-cadastro'), { isForm: true, isEntregue: isEntregue })

    }

    savePedidoInicial() {

        let promise = $.Deferred()

        let $form = $('#block-form-pedido-fabrica #form-cadastro')

        let formMap = utils.FormUtil.mapObject($form)


        this._model.save({
            fabricaId: formMap.formObject.fabricaId,
            dataEntrega: formMap.formObject.dataEntrega,
            status: 'pendente'
        }, false).then((data = {}) => {

            let pedido = data.data

            formMap.formElement.observacao.val(pedido.observacao)
            formMap.formElement.dataEntrega.val(pedido.dataEntrega)
            formMap.formElement.status.val(pedido.status)
            formMap.formElement.id.val(pedido.id)
            formMap.formElement.uuid.val(pedido.uuid)
            formMap.formElement.isNF.find('option').filter((i, e) => { return $(e).text() == utils.StringUtil.booleanToString(pedido.isNF) })
            promise.resolve(pedido)
        }).catch((err) => {
            promise.reject(err)
        })

        return promise.promise()


    }

    save(e, options = {}) {
        e.preventDefault()

        let $form = $('#block-form-pedido-fabrica #form-cadastro')

        let formMap = utils.FormUtil.mapObject($form)

        formMap.formElement.status.val('pendente')

        this._model.save($form).then((r) => {

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




    renderAutoCompleteCadastro(e, data = {}) {

        utils.UnderscoreUtil._template('#template-pedido-fabrica-lancamento-produto-autocomplete', {}, '#inner-produto-autocomplete')

        utils.AutoCompleteUtil.AutoComplete({
            type: 'produto',
            bloco: '#block-form-pedido-fabrica #bloco-autocomplete-produto-pedido',
            input: 'input[name="produto"]',
            isClearValue: true,
            fabricaId: data.fabricaId,

            callback: (item) => {

                $('body').find('#block-form-pedido-fabrica #inner-lancamento-produto').slideUp('slow').html('')

                utils.UnderscoreUtil._template('#template-pedido-fabrica-lancamento-produto', { produto: item.data }, '#inner-lancamento-produto')

                $('body').find('#block-form-pedido-fabrica #inner-lancamento-produto').slideDown('slow')

                utils.MaskInputUtil.mask()

                this.calcularTotalPedido()
            }

        })
    }




    renderSelecaoFabrica(e, data = {}) {

        $('#block-form-pedido-fabrica #btn-cancelar-pedido').hide()

        utils.UnderscoreUtil._template('#template-pedido-fabrica-lancamento-step1', {}, '#inner-fabrica-lancamento')



        utils.ApiUtil.listFabricas().then((fabricas) => {
            let select = $('#block-form-pedido-fabrica #inner-fabrica-lancamento').find('#fabrica-selecao')
            select.append('<option value="">Selecione...</option>')
            fabricas.forEach((item) => {
                select.append(`<option value="${item.pessoaId}" ${item.pessoaId == data.fabricaId ? 'selected' : ''} >${item.nomeFantasia} - ${item.razaoSocial}</option>`)
            })
        })
    }


    selecionarOutraFabrica(e) {
        e.preventDefault()

        let isItensLancados = $('#block-form-pedido-fabrica #form-cadastro #inner-produtos-lancados table.row-item-list').length > 0

        if (isItensLancados) {
            utils.MessageUtil.alert('Para selecionar outra fabrica deve-se finalizar o pedido atual!', 'warning')
        } else {
            $('#block-form-pedido-fabrica #form-cadastro').find('#form-itens-hidden-to-editable').hide()
            $('#block-form-pedido-fabrica #form-cadastro').find('input[name="fabricaId"]').val('')
            this.renderCadastro()
        }
    }

    selecionarFornecedor(e) {
        e.preventDefault()

        let select = $(e.currentTarget)

        if (select.val() == '')
            return

        let pedidoFabrica = this._model.model($('#block-form-pedido-fabrica #form-cadastro')).formObject


        pedidoFabrica.status = 'pendente'
        pedidoFabrica.fabricaId = select.val()


        this._model.save(pedidoFabrica, false).then((data = {}) => {
            this.renderCadastro(data.data)
        }).catch((err) => {
            // this.renderSelecaoFornecedor()
            utils.MessageUtil.error(err)
        })
    }

    renderFabricaSelecionada(fabrica = {}) {

        if (!$('body').find('#block-form-pedido-fabrica #inner-fabrica-lancamento').is(':visible'))
            $('body').find('#block-form-pedido-fabrica #inner-fabrica-lancamento').slideUp('slow').html('')

        utils.UnderscoreUtil._template('#template-pedido-fabrica-selecionado', { fabrica: fabrica }, '#inner-fabrica-lancamento')

        $('body').find('#inner-fabrica-lancamento').slideDown('slow')

        $('#block-form-pedido-fabrica #form-cadastro').find('input[name="fabricaId"]').val(fabrica.id)
        $('#block-form-pedido-fabrica #form-cadastro').find('#form-itens-hidden-to-editable').show()

        if (['lancado', 'cancelado', 'entregue'].indexOf(_cache.pedido.status) !== -1)
            $('#block-form-pedido-fabrica #form-cadastro').find('#selecionar-outra-fabrica').hide()
    }

    renderMenuClassificacao() {


        utils.ApiUtil.listGrupos().then(grupos => {

            let classificacoesCodigos = []

            let codigos = []

            grupos.forEach(item => {
                if (item.breadCrumb && item.grupoPaiId > 0) {
                    codigos.push({ id: item.grupoPaiId })
                }
            })


            grupos.forEach(async item => {
                if (item.breadCrumb) {
                    let existsCodigo = _.find(codigos, { id: item.id })
                    if (!existsCodigo)
                        classificacoesCodigos.push(item)
                }
            })

            let $block = $('#block-form-pedido-fabrica #form-cadastro #inner-menu-classificacao')



            classificacoesCodigos.forEach(item => {
                let button = `<button type="button" style="margin-bottom: 10px" class="btn btn-sm btn-primary" value="">${item.breadCrumb} -> ${item.descricao}</button>`
                $block.append(button)
            })
        })

    }



    renderCadastro(data = {}) {

        try {

            this.breadCrumbs()

            utils.HtmlUtil.loader()

            let isVisualizacao = ['lancado', 'cancelado', 'entregue'].indexOf(data.status) !== -1

            if (data.id === undefined)
                this._bread.add('Novo Pedido').show()
            else if (isVisualizacao == true)
                this._bread.add(`Visialuzação de pedido ${data.id}`).show()
            else
                this._bread.add(`Edição de pedido ${data.id}`).show()


            //Template layout.pug
            utils.UnderscoreUtil._template('#template-pedidos-fabrica', {}, '#inner-content')

            //template compras.pug
            utils.UnderscoreUtil._template('#template-children-pedido-fabrica', {}, '#inner-content-children')

            //template notafiscal.pug
            utils.UnderscoreUtil._template('#template-children-pedido-fabrica-lancamento', {}, '#inner-content-children-pedido-fabrica')

            //template nova-nota.pug
            utils.UnderscoreUtil._template('#template-pedido-fabrica-lancamento-form-principal', { form: data }, '#inner-content-children-pedido-fabrica')

            utils.UnderscoreUtil._template('#template-pedido-fabrica-lancamento-cabecalho', { form: data }, '#inner-cabecalho-pedido')


            if (!data.fabrica)
                this.renderSelecaoFabrica(undefined, data)
            else
                this.renderFabricaSelecionada(data.fabrica)


            if (data.id)
                _cache.pedido = data


            if (data.id) {

                this.renderAutoCompleteCadastro(undefined, data)

                if (data.itens && (data.itens.length > 0))
                    this.adicionarProduto(null, data.itens)


                $('#block-form-pedido-fabrica #form-cadastro')
                    .find('select[name="isNF"] option')
                    .filter((i, e) => { return $(e).val() == `${data.isNF}` })
                    .prop("selected", true)
                    .change()

                $('#block-form-pedido-fabrica #form-cadastro')
                    .find('select[name="consignado"] option')
                    .filter((i, e) => { return $(e).val() == `${data.consignado}` })
                    .prop("selected", true)
                    .change()

                /*
                this.renderMenuClassificacao()


                utils.UnderscoreUtil._template('#template-pedido-fabrica-lista-produtos-grade', {}, '#inner-lista-produtos-grade')
                this._model.listProdutosFabrica(data.fabricaId).then(retorno => {
                    //$('#inner-lista-produtos-grade')
                })*/



            }


            if (isVisualizacao == true) {


                $('#block-form-pedido-fabrica #form-cadastro #bloco-btn-lancamento').find('button').each((i, item) => { $(item).hide() })

                if (data.status == 'lancado')
                    $('#block-form-pedido-fabrica #form-cadastro #btn-entregar-pedido').show().attr({ 'disabled': false })

                $('#block-form-pedido-fabrica #form-cadastro #inner-produto-autocomplete').html('')
                $('#block-form-pedido-fabrica #form-cadastro .remover-produto-lancado').each((i, item) => { $(item).hide() })
                $('#block-form-pedido-fabrica #form-cadastro .form-control').each((i, item) => { $(item).attr('disabled', true) })
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
    PedidoFabricaView: () => { return new PedidoFabricaView() },
    PedidoFabricaListView: () => { return new PedidoFabricaListView() }
}


