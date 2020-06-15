let utils = require('../../../helpers/utils-admin')


let _cache = {
    produtosLancados: [],
    pedido: {}

}

let paginator = utils.PaginatorUtil.paginator()

class PedidoClienteModel extends utils.BackboneModelUtil {

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

        this.url = utils.UrlUtil.url(`admin/pedidos-cliente/listar-pedidos`)

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
        this.url = utils.UrlUtil.url(`admin/pedidos-cliente/save`)

        let send = { data: isForm ? this.model(data).formObject : data, type: 'POST' }

        return await this.fetch(send)
    }

    async cancelarPedido(data) {
        this.url = utils.UrlUtil.url(`admin/pedidos-cliente/cancelar-pedido`)

        let send = { data: data, type: 'POST' }

        return await this.fetch(send)
    }

    async saveItem(data) {
        this.url = utils.UrlUtil.url(`admin/pedidos-cliente/save-item`)

        let send = { data: data, type: 'POST' }

        return await this.fetch(send)
    }

    async removeItem(item = {}, numero = undefined) {

        this.url = utils.UrlUtil.url(`admin/pedidos-cliente/remove-item`)

        let send = {}


        if (numero)
            send = { data: { numero: numero, removeAll: true }, type: 'POST' }
        else
            send = { data: { id: item.id, pedidoClienteId: item.pedidoClienteId, produtoId: item.produtoId }, type: 'POST' }

        return await this.fetch(send)
    }


    savePedidoView = async (data, options = {}) => {
        let run = () => {

            

            this.save(data, options.isForm).then((r) => {

                utils.MessageUtil.message(r.message, 'info', {
                    buttons: {
                        'Fechar': (event) => {
                            utils.MessageUtil.closeButton(event)
                            if(options.element)
                                $(options.element).remove()
                            else
                                utils.UrlUtil.loadUrlBackbone('pedidos/cliente/pesquisa')

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


        if (options.isEntregue)
            msg = 'Deseja marcar o pedido como Entregue?<br />Após este procedimento, não será mais possível cancelar o pedido!'
        else if('pedidoIsConsignado' in options){
            data.pedidoIsConsignado = options.pedidoIsConsignado
            msg = `Deseja ${options.pedidoIsConsignado == false ? 'definir o pedido como NORMAL' : 'alterar o pedido para CONSIGNADO'}?`
        }else
            msg = 'Deseja finalizar o pedido?<br />Após lançamento, será dado baixa de estoque para os produtos!'


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
                                utils.UrlUtil.loadUrlBackbone('pedidos/cliente/pesquisa')

                            utils.MessageUtil.closeButton(e)
                        }
                    }
                })
            }).catch((err) => {

                utils.MessageUtil.error(err)
            })
        }


        if (['lancado', 'pendente','cancelado','entregue'].indexOf(pedido.status) !== -1) {


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
            else if(pedido.status == 'cancelado' && isEstorno == true)
                msg = 'Deseja voltar o pedido para pendente?'
            else if (['lancado', 'entregue'].indexOf(pedido.status) !== -1)
                msg = 'Deseja cancelar o pedido?<br />As contas de recebimento, movimentação e estoques irão ser atualizados!'
            else
                msg = 'Deseja realmente cancelar este pedido?'

            utils.MessageUtil.message(msg, 'warning', options)

        }


    }

}



class PedidoClienteListView extends Backbone.View {
    constructor(options = {}) {
        super()

        this._bread = new utils.BreadCrumb()

        paginator = utils.PaginatorUtil.paginator()

        utils.UrlUtil.setUrlHash('pedidos/cliente/pesquisa')


        this._model = new PedidoClienteModel()

        this.$el = $('body')

        this.overrideEvents()

        this.render()
    }


    reset() {
        this.$el.off('click', '#block-list-pedido-cliente .btn-visualizar-pedido')
        this.$el.off("click", "#block-list-pedido-cliente .btn-cancelar-pedido")
        this.$el.off("click", "#block-list-pedido-cliente .pesquisar")
        this.$el.off("click", "#block-list-pedido-cliente .limpar-pesquisa")
        this.$el.off('click', '#block-list-pedido-cliente .btn-estornar-pedido')
        this.$el.off('click', '#block-list-pedido-cliente .carregar-mais')
        this.$el.off('click', '#block-list-pedido-cliente .btn-visualizar-pedido-info')
        this.$el.off('click', '#block-list-pedido-cliente .btn-marcar-como-entregue')
        this.$el.off('click', '#block-list-pedido-cliente .btn-is-pedido-consignado-or-normal-pedido')
        this.$el.off('click', '#block-list-pedido-cliente .btn-lancar-pedido')


    }


    overrideEvents() {
        this.reset()

        this.delegateEvents({
            "click #block-list-pedido-cliente .btn-visualizar-pedido": "visualizarPedidoDetalhado",
            "click #block-list-pedido-cliente .btn-cancelar-pedido": "cancelarPedidoView",
            "click #block-list-pedido-cliente .btn-estornar-pedido": "estornarPedidoView",
            'click #block-list-pedido-cliente .pesquisar': 'pesquisarPedidos',
            'click #block-list-pedido-cliente .limpar-pesquisa': 'limparPesquisaPedidos',
            'click #block-list-pedido-cliente .carregar-mais': 'carregarMaisItensCadastro',
            'click #block-list-pedido-cliente .btn-visualizar-pedido-info': 'visualizacaoRapida',
            'click #block-list-pedido-cliente .btn-marcar-como-entregue': 'marcarComoEntregue',
            'click #block-list-pedido-cliente .btn-is-pedido-consignado-or-normal-pedido': 'transformarPedidoConsignadoOrNormal',
            'click #block-list-pedido-cliente .btn-lancar-pedido':'lancarPedido'

        })



    }


    async lancarPedido(e){
        e.preventDefault()

        let item = utils.JsonUtil.toParse($(e.currentTarget).closest('.row-item-list').attr('data-item'))

        if(item.status != 'pendente')
            return await utils.MessageUtil.alert('Não é possível lançar este pedido! Status inválido!')

        item.status = 'lancado'
        
        await this._model.savePedidoView(item, {isForm: false,  element : $(e.currentTarget).closest('.row-item-list')})
    }
    

    

    async transformarPedidoConsignadoOrNormal(e){
        e.preventDefault()

        let pedido = utils.JsonUtil.toParse($(e.currentTarget).closest('.row-item-list').attr('data-item'))

        let pedidoIsConsignado = pedido.consignado == true ? false : true

        await this._model.savePedidoView(pedido, {isForm : false, pedidoIsConsignado : pedidoIsConsignado, element : $(e.currentTarget).closest('.row-item-list')})
    }


    async marcarComoEntregue(e){
        e.preventDefault()
        
        let pedido = utils.JsonUtil.toParse($(e.currentTarget).closest('.row-item-list').attr('data-item'))

        pedido.status = 'entregue'

        await this._model.savePedidoView(pedido, {isForm : false, isEntregue : true, element : $(e.currentTarget).closest('.row-item-list')})
    }


    limparPesquisaPedidos(e) {
        e.preventDefault()

        utils.localStorageUtil.removeStorage('ultima_pesquisa_pedidos_cadastro')

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

        let html = await utils.UnderscoreUtil._template('#template-list-pedidos-info-pedido-lancado', { form: pedido, lancamentos: pedido.itens })


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

        utils.UrlUtil.setUrlHash('pedidos/cliente/lancamento')

        _cache.pedido = data

        new PedidoClienteView(data)

    }


    renderAutoCompleteClienteFormPesquisa() {
        utils.UnderscoreUtil._template('#template-form-pesquisa-pedido-autocomplete-cliente', {}, '#inner-cliente-autocomplete-pesquisa')

        utils.AutoCompleteUtil.AutoComplete({
            type:'cliente',
            bloco: '#block-list-pedido-cliente #bloco-autocomplete-pedido-cliente',
            input: 'input[name="pesquisa_clienteId"]',
            isClearValue: false,
            form: '#block-list-pedido-cliente #form-pesquisa'

        })
    }

    getFormPesquisaCache() {
        let form = {}
   
        if (utils.localStorageUtil.isStorageItem('ultima_pesquisa_pedidos_cadastro'))
            form = utils.localStorageUtil.getStorage('ultima_pesquisa_pedidos_cadastro')

        return form
    }


    renderFormPesquisa() {

        let form = this.getFormPesquisaCache()


        utils.UnderscoreUtil._template("#template-form-pesquisa-pedido-cliente", { form: form }, '#inner-form-pesquisa-pedido-cliente')


        $.when(utils.EstadoMunicipioUtil.municipioSelectBox(
            {
                municipioElement: '#block-list-pedido-cliente #pesquisa-municipio',
                municipio: form.municipio
            }
        ))

        this.renderAutoCompleteClienteFormPesquisa()

        let select = $('#block-list-pedido-cliente #form-pesquisa').find('#pesquisa-status')

        let selectConsignado = $('#block-list-pedido-cliente #form-pesquisa').find('#pesquisa-consignado')

        utils.ApiUtil.listBooleanSimNao().forEach( item => {
            selectConsignado.append(`<option value="${item.value}" ${item.value == form.consignado || item.default === true  ? 'selected' : ''} >${item.text}</option>`)
        })
            

        utils.ApiUtil.statusPedido().then((status) => {

            select.append(`<option value="">Selecione</option>`)
            select.append(`<option value="all">Todos</option>`)

            status.forEach((item) => {

                select.append(`<option value="${item.value}" ${item.value == form.status ? 'selected' : ''} >${item.text}</option>`)
            })
        })


    }

    carregarMaisItensCadastro(e) {
        e.preventDefault()

        $('#block-list-pedido-cliente .carregar-mais').attr({ 'disabled': true })

        this.carregarListaPedidos({ append: true })
    }


    pesquisarPedidos(e) {
        if (e)
            e.preventDefault()

        paginator = utils.PaginatorUtil.paginator()

        let form = utils.FormUtil.mapObject('#block-list-pedido-cliente #form-pesquisa')

        utils.localStorageUtil.setStorage('ultima_pesquisa_pedidos_cadastro', form.formObject.pesquisa)



        this.carregarListaPedidos()

    }

    carregarListaPedidos(options) {

        let form = this.getFormPesquisaCache()

        let overlay = $(`#block-list-pedido-cliente #overlay-painel-list-cadastro`).find('.overlay')

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
            utils.UnderscoreUtil._template('#template-pedidos-cliente', {}, '#inner-content')

            //template compras.pug
            utils.UnderscoreUtil._template('#template-children-pedido-cliente', {}, '#inner-content-children')

            //tempalte notafiscal.pug
            utils.UnderscoreUtil._template('#template-children-pedido-cliente-list', {}, '#inner-content-children-pedido-cliente')


            utils.UnderscoreUtil._template('#template-list-pedidos-lancados-parent', {}, '#inner-pedidos-lancados-parent')

            //
            this.renderFormPesquisa()
        } catch (err) {
            utils.MessageUtil.error(err)
        }
    }

    renderPedidos(data = {}, options = {}) {

        _.assign(options, { isDesktopMobile: true, closeLoader: true })

        utils.UnderscoreUtil._template('#template-list-pedidos-lancados', { pedidos: data }, '#inner-pedidos-lancados', options)

        if (data.length > 0)
            $('#block-list-pedido-cliente .carregar-mais').attr({ 'disabled': false })

        $('#block-list-pedido-cliente').find('#inner-pedidos-lancados-desktop, #inner-pedidos-lancados-mobile').find('.status-print').each((i, item) => {

            let status = $(item).text()

            let block = $(item).closest('.row-item-list')

            if (['cancelado'].indexOf(status) !== -1)
                $(block).find('.btn-cancelar-pedido').hide()


            if(['cancelado', 'entregue', 'lancado'].indexOf(status) !== -1)
                $(block).find('.btn-visualizar-pedido').hide()


            
            if(['cancelado','entregue'].indexOf(status) !== -1)
                $(block).find('.btn-is-pedido-consignado-or-normal-pedido').hide()

            if (['lancado','cancelado'].indexOf(status) === -1)
                $(block).find('.btn-estornar-pedido').hide()
            
            if(['pendente'].indexOf(status) === -1)
                $(block).find('.btn-lancar-pedido').hide()
                
            

            if(['lancado'].indexOf(status) !== -1)
                $(block).find('.btn-marcar-como-entregue').show()
            else
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

class PedidoClienteView extends Backbone.View {

    constructor(pedido = {}) {
        super()


        this._bread = new utils.BreadCrumb()

        this.breadCrumbs()


        this._model = new PedidoClienteModel()

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
        this.$el.off('click', '#block-list-pedido-cliente #btn-novo-cadastro')
        this.$el.off('click', '#block-form-pedido-cliente #btn-novo-cadastro')
        this.$el.off('click', '#block-form-pedido-cliente #form-cadastro #save')
        this.$el.off("click", "#block-form-pedido-cliente #form-cadastro #adicionar-produto")
        this.$el.off("click", "#block-form-pedido-cliente #form-cadastro #btn-lancar-pedido")
        this.$el.off("click", "#block-form-pedido-cliente #form-cadastro .remover-produto-lancado")
        this.$el.off("click", "#block-form-pedido-cliente #form-cadastro #btn-cancelar-pedido")
        this.$el.off('click', '#block-form-pedido-cliente #form-cadastro #selecionar-outro-cliente')
        this.$el.off("blur", "#block-form-pedido-cliente #form-cadastro #lancamento-quantidade")
        this.$el.off("blur", "#block-form-pedido-cliente #form-cadastro #lancamento-precoVenda")
        this.$el.off("blur", "#block-form-pedido-cliente #form-cadastro #lancamento-precoVendaUnitario")
        this.$el.off('change', '#block-form-pedido-cliente #form-cadastro #lancamento-tipo-unidade')
        this.$el.off('change', '#block-form-pedido-cliente #form-cadastro #lancamento-is-bonificado')
        this.$el.off('click', '#block-form-pedido-cliente #form-cadastro #btn-entregar-pedido')
        this.$el.off('click', '#block-form-pedido-cliente #form-cadastro #cancelar-lancamento')
        this.$el.off('click', '#block-form-pedido-cliente #form-cadastro #btn-print')

    }


    overrideEvents() {
        this.reset()

        this.delegateEvents({
            "click #block-list-pedido-cliente #btn-novo-cadastro": "renderCadastro",
            "click #block-form-pedido-cliente #btn-novo-cadastro": "novoCadastro",
            "click #block-form-pedido-cliente #form-cadastro #save": "save",
            "click #block-form-pedido-cliente #form-cadastro #btn-cancelar-pedido": "cancelarPedidoView",
            "click #block-form-pedido-cliente #form-cadastro #btn-lancar-pedido": "lancarPedido",
            "click #block-form-pedido-cliente #form-cadastro #adicionar-produto": "adicionarProduto",
            "click #block-form-pedido-cliente #form-cadastro .remover-produto-lancado": 'removerProdutoLancado',
            'click #block-form-pedido-cliente #form-cadastro #selecionar-outro-cliente': 'selecionarOutroCliente',
            'change #block-form-pedido-cliente #form-cadastro #lancamento-tipo-unidade': 'calcularSubtotalItem',
            "change #block-form-pedido-cliente #form-cadastro #lancamento-is-bonificado": "calcularSubtotalItem",
            "blur #block-form-pedido-cliente #form-cadastro #lancamento-quantidade": "calcularSubtotalItem",
            "blur #block-form-pedido-cliente #form-cadastro #lancamento-precoVenda": "calcularSubtotalItem",
            "blur #block-form-pedido-cliente #form-cadastro #lancamento-precoVendaUnitario": "calcularSubtotalItem",
            'click #block-form-pedido-cliente #form-cadastro #btn-entregar-pedido': 'lancarPedidoEntregue',
            'click #block-form-pedido-cliente #form-cadastro #cancelar-lancamento': 'cancelarLancamentoProduto',
            'click #block-form-pedido-cliente #form-cadastro #btn-print': 'printPDF'

        })

    }

    printPDF(e){
        e.preventDefault()


        let $form = $('#block-form-pedido-cliente #form-cadastro')

        let formMap = utils.FormUtil.mapObject($form)

        if(utils.ObjectUtil.getValueProperty(formMap, 'formObject.uuid'))
            utils.FormUtil.redirectBlank(`/reports/pedidos/report-cliente/${formMap.formObject.uuid}`)

    }

    novoCadastro(e) {
        e.preventDefault()

        new PedidoClienteView()

    }
 

    cancelarLancamentoProduto(e) {
        e.preventDefault()


        $('body').find('#block-form-pedido-cliente #inner-lancamento-produto').slideUp('slow').html('')
    }


    calcularSubtotalItem(e) {
        
        e.preventDefault()


        
        let produto = utils.JsonUtil.toParse($('body').find('#block-form-pedido-cliente #form-lancamento-produto-pedido').attr('data-item'))

        let formLancamento = this._model.model($('body #block-form-pedido-cliente #form-lancamento-produto-pedido'))

        let formElement = formLancamento.formElement.lancamento
        let formObject = formLancamento.formObject.lancamento


        if(formObject.isBonificado == 'true'){
            formElement.precoVenda.val('0.00')
            formElement.precoVendaUnitario.val('0.00')
            formObject.precoVenda = 0.00
            formObject.precoVendaUnitario = 0.00
        }else{
            formElement.precoVenda.val(produto.precoVenda)
            formElement.precoVendaUnitario.val(produto.precoVendaUnitario)
        }

        let isDataAttrPreco = $(e.currentTarget).attr('data-attr')

        if(['preco-venda-unitario'].indexOf(isDataAttrPreco) !== -1 &&  utils.NumberUtil.cdbl(formObject.precoVendaUnitario) > 0 && utils.NumberUtil.cdbl(formObject.precoVendaUnitario) != utils.NumberUtil.cdbl(produto.precoVendaUnitario)){
            formObject.precoVenda = utils.NumberUtil.multiplicacao(formObject.precoVendaUnitario, produto.fracao)
            formElement.precoVenda.val(formObject.precoVenda)
            formElement.precoVendaUnitario.val(formObject.precoVendaUnitario)
        }else if(['preco-venda'].indexOf(isDataAttrPreco) !== -1 && utils.NumberUtil.cdbl(formObject.precoVenda) > 0 && utils.NumberUtil.cdbl(formObject.precoVenda) != utils.NumberUtil.cdbl(produto.precoVenda)){
            formObject.precoVendaUnitario = utils.NumberUtil.divisao(formObject.precoVenda, produto.fracao)
            formElement.precoVendaUnitario.val(formObject.precoVendaUnitario)
            formElement.precoVenda.val(formObject.precoVenda)
        }else{
            formElement.precoVenda.val(formObject.precoVenda)
            formElement.precoVendaUnitario.val(formObject.precoVendaUnitario)
        }
        

        if ( formObject.tipoUnidade == 'UNITARIO')
            formElement.subtotal.val(utils.NumberUtil.numberFormat(utils.NumberUtil.multiplicacao(utils.NumberUtil.divisao(formObject.precoVenda, produto.fracao), formObject.quantidade),2))
        else
            formElement.subtotal.val(utils.NumberUtil.numberFormat(utils.NumberUtil.multiplicacao(formObject.precoVenda, formObject.quantidade), 2))


        /*

        let isBonificado = $('body').find('#block-form-pedido-cliente #lancamento-is-bonificado').val()


        if (isBonificado == 'true')
            $('body').find('#block-form-pedido-cliente #lancamento-precoVenda').val('0.00')
        else if ($('body').find('#block-form-pedido-cliente #lancamento-precoVenda').val() == '0.00')
            $('body').find('#block-form-pedido-cliente #lancamento-precoVenda').val(produto.precoVenda)


        let precoVenda = parseFloat($('body').find('#block-form-pedido-cliente #lancamento-precoVenda').val())
        let tipoUnidadePedido = $('body').find('#block-form-pedido-cliente #lancamento-tipo-unidade').val()
        let quantidade = $('body').find('#block-form-pedido-cliente #lancamento-quantidade').val()


        let subtotalBlock = $('body').find('#block-form-pedido-cliente #lancamento-subtotal')


        if (tipoUnidadePedido == 'UNITARIO')
            $(subtotalBlock).val(utils.NumberUtil.numberFormat(utils.NumberUtil.multiplicacao(utils.NumberUtil.divisao(precoVenda, produto.fracao), quantidade),2))
        else
            $(subtotalBlock).val(utils.NumberUtil.numberFormat(utils.NumberUtil.multiplicacao(precoVenda, quantidade), 2))

        */
    }

    calcularTotalPedido() {


        let totalItens = 0
        let totalPedido = 0

        try {
            _cache.produtosLancados.forEach((item) => {
                totalItens = utils.NumberUtil.sum(totalItens, item.quantidade)
                totalPedido = utils.NumberUtil.sum(totalPedido, item.total)
            })

        } catch (err) {

        }


        $('body').find('#block-form-pedido-cliente .total-itens-quantidade').text(totalItens)
        $('body').find('#block-form-pedido-cliente .total-itens-valor').text(`R$ ${utils.NumberUtil.numberFormat(totalPedido, 2)}`)


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
                $('#block-form-pedido-cliente #save').hide()
                $('#block-form-pedido-cliente #btn-lancar-pedido').hide()

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
                $('#block-form-pedido-cliente #save').show()
                $('#block-form-pedido-cliente #btn-lancar-pedido').show()
                $('#block-form-pedido-cliente #btn-cancelar-pedido').show()
            } else {

                let produto = utils.FormUtil.mapObject('#block-form-pedido-cliente #form-lancamento-produto-pedido')

                /*
                let data = {
                    idx: -1,
                    item: null
                }*/

                if (produto.formObject.lancamento.quantidade <= 0 || produto.formObject.lancamento.custo <= 0) {
                    utils.MessageUtil.error('É necessário informar quantidade e custo para lançamento do item!')
                    return false
                }


                /*
                let itemData = {}

                if (data.idx > -1)
                    itemData = data.item
                else
                */
                let itemData = produto.formObject.lancamento


                if (!_cache.pedido.id)
                    _cache.pedido = await this.savePedidoInicial()


                let obj = {
                    precoVenda: itemData.precoVenda,
                    quantidade: itemData.quantidade,
                    produto: itemData.produto,
                    produtoId: itemData.produtoId,
                    pedidoClienteId: _cache.pedido.id,
                    isBonificado: itemData.isBonificado,
                    tipoUnidade: itemData.tipoUnidade,
                    total: itemData.subtotal,
                    isNF: itemData.isNF

                }

                let item = await this._model.saveItem(obj).catch((err) => { utils.MessageUtil.error(err) })

                if(item == undefined)
                    return

                

                obj.id = item.id

               // if (data.idx > -1)
                //    _cache.produtosLancados[data.idx] = obj
               // else
                _cache.produtosLancados.push(obj)




                if (_cache.produtosLancados.length > 0) {

                    $('#block-form-pedido-cliente #save').show()
                    $('#block-form-pedido-cliente #btn-lancar-pedido').show()
                    $('#block-form-pedido-cliente #btn-cancelar-pedido').show()
                }

                isSave = true

            }


            utils.UnderscoreUtil._template('#template-pedido-cliente-produtos-lancados', { lancamentos: _cache.produtosLancados }, '#inner-produtos-lancados')
            $('body').find('#block-form-pedido-cliente #inner-lancamento-produto').slideUp('slow').html('')

            this.calcularTotalPedido()

            if (isSave)
                await this.save(e, { noMessage: true })

        } catch (err) {
            utils.MessageUtil.error(err)
        }


    }

    cancelarLancamento(e) {
        e.preventDefault()
        $('body').find('#block-form-pedido-cliente #inner-lancamento-produto').slideUp('slow').html('')
    }

    cancelarPedidoView(e) {


        e.preventDefault()

        let pedido = utils.FormUtil.mapObject('#block-form-pedido-cliente #form-cadastro')

        this._model.cancelarPedidoView(pedido.formObject)


    }

    lancarPedidoEntregue(e) {
        e.preventDefault()

        this.lancarPedido(e, true)

    }

    lancarPedido(e, isEntregue = false) {
        e.preventDefault()

        if (isEntregue)
            $("#block-form-pedido-cliente #form-cadastro").find('input[name="status"]').val('entregue')
        else
            $("#block-form-pedido-cliente #form-cadastro").find('input[name="status"]').val('lancado')


        this._model.savePedidoView($('#block-form-pedido-cliente #form-cadastro'), {isForm : true, isEntregue: isEntregue})

    }

    savePedidoInicial() {

        let promise = $.Deferred()

        let $form = $('#block-form-pedido-cliente #form-cadastro')

        let formMap = utils.FormUtil.mapObject($form)


        this._model.save({
            clienteId: formMap.formObject.clienteId,
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

        let $form = $('#block-form-pedido-cliente #form-cadastro')

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

        utils.UnderscoreUtil._template('#template-pedido-cliente-lancamento-produto-autocomplete', {}, '#inner-produto-autocomplete')

        utils.AutoCompleteUtil.AutoComplete({
            type:'produto',
            bloco: '#block-form-pedido-cliente #bloco-autocomplete-produto-pedido',
            input: 'input[name="produto"]',
            isClearValue: true,

            callback: (item) => {

                $('body').find('#block-form-pedido-cliente #inner-lancamento-produto').slideUp('slow').html('')


                utils.UnderscoreUtil._template('#template-pedido-cliente-lancamento-produto', { produto: item.data }, '#inner-lancamento-produto')

                $('body').find('#block-form-pedido-cliente #inner-lancamento-produto').slideDown('slow')

                utils.MaskInputUtil.mask()

                this.calcularTotalPedido()
            }

        })
    }


    renderAutoCompleteCliente(e, data = {}) {

        $('#block-form-pedido-cliente #btn-cancelar-pedido').hide()

        utils.UnderscoreUtil._template('#template-pedido-cliente-lancamento-cliente-autocomplete', {}, '#inner-cliente-autocomplete')

        utils.AutoCompleteUtil.AutoComplete({
            type:'cliente',
            bloco: '#block-form-pedido-cliente #bloco-autocomplete-pedido-cliente',
            input: 'input[name="cliente"]',
            isClearValue: true,

            callback: (item) => {

                this.renderAutoCompleteCadastro()
                this.renderClienteSelecionado(item.data)

            }

        })
    }


    selecionarOutroCliente(e) {
        e.preventDefault()

        if ($('#block-form-pedido-cliente #form-cadastro').find('input[name="id"]').val() > 0) {
            utils.MessageUtil.message('Para selecionar outro cliente deve-se finalizar o pedido atual!', 'warning')
        } else {
            $('#block-form-pedido-cliente #form-cadastro').find('#form-itens-hidden-to-editable').hide()
            $('#block-form-pedido-cliente #form-cadastro').find('input[name="clienteId"]').val('')
            this.renderCadastro()
        }
    }

    renderClienteSelecionado(pessoa = {}) {

        if (!$('body').find('#block-form-pedido-cliente #inner-cliente-autocomplete').is(':visible'))
            $('body').find('#block-form-pedido-cliente #inner-cliente-autocomplete').slideUp('slow').html('')

        utils.UnderscoreUtil._template('#template-pedido-cliente-selecionado', { pessoa }, '#inner-cliente-autocomplete')

        $('body').find('#inner-cliente-autocomplete').slideDown('slow')

        $('#block-form-pedido-cliente #form-cadastro').find('input[name="clienteId"]').val(pessoa.id)
        $('#block-form-pedido-cliente #form-cadastro').find('#form-itens-hidden-to-editable').show()

        if (['lancado', 'cancelado', 'entregue'].indexOf(_cache.pedido.status) !== -1)
            $('#block-form-pedido-cliente #form-cadastro').find('#selecionar-outro-cliente').hide()

        //utils.UnderscoreUtil._template('#template-pedido-cliente-lancamento-cabecalho', { form: cliente }, '#inner-cabecalho-pedido')

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
            utils.UnderscoreUtil._template('#template-pedidos-cliente', {}, '#inner-content')

            //template compras.pug
            utils.UnderscoreUtil._template('#template-children-pedido-cliente', {}, '#inner-content-children')

            //template notafiscal.pug
            utils.UnderscoreUtil._template('#template-children-pedido-cliente-lancamento', {}, '#inner-content-children-pedido-cliente')

            //template nova-nota.pug
            utils.UnderscoreUtil._template('#template-pedido-lancamento-form-principal', {form : data}, '#inner-content-children-pedido-cliente')

            utils.UnderscoreUtil._template('#template-pedido-cliente-lancamento-cabecalho', { form: data }, '#inner-cabecalho-pedido')


            if (!data.clienteRef)
                this.renderAutoCompleteCliente()
            else
                this.renderClienteSelecionado(data.clienteRef)


            if (data.id)
                _cache.pedido = data


            if (data.id) {

                this.renderAutoCompleteCadastro(undefined, data)

                if (data.itens && (data.itens.length > 0))
                    this.adicionarProduto(null, data.itens)


                $('#block-form-pedido-cliente #form-cadastro')
                    .find('select[name="isNF"] option')
                    .filter((i, e) => { return $(e).val() == `${data.isNF}` })
                    .prop("selected", true)
                    .change()

                $('#block-form-pedido-cliente #form-cadastro')
                    .find('select[name="consignado"] option')
                    .filter((i,e ) => { return $(e).val() == `${data.consignado}` })
                    .prop("selected", true)
                    .change()

            }


            if (isVisualizacao == true) {


                $('#block-form-pedido-cliente #form-cadastro #bloco-btn-lancamento').find('button').each((i, item) => { $(item).hide() })

                if (data.status == 'lancado')
                    $('#block-form-pedido-cliente #form-cadastro #btn-entregar-pedido').show().attr({ 'disabled': false })

                $('#block-form-pedido-cliente #form-cadastro #inner-produto-autocomplete').html('')
                $('#block-form-pedido-cliente #form-cadastro .remover-produto-lancado').each((i, item) => { $(item).hide() })
                $('#block-form-pedido-cliente #form-cadastro .form-control').each((i, item) => { $(item).attr('disabled', true) })
            }

            utils.JqueryUtil.initializeComponentesJquery()


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
    PedidoClienteView: () => { return new PedidoClienteView() },
    PedidoClienteListView: () => { return new PedidoClienteListView() }
}


