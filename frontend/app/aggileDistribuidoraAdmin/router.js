const controller = require('./controllers')
const utils = require('../../helpers/utils-admin')

const closeMenuLeft = () => {
    if (utils.MobileUtil.isMobile())
        if ($(`body`).hasClass('sidebar-open'))
            $(`body`).removeClass('sidebar-open')

}


class Router extends Backbone.Router {
    routes() {
        return {
            "logout": "logout",
            "/": "home",
            "home": "home",
            "cadastro-de-fabricas/:type": "fabrica",
            "cadastro-de-clientes/:type": "cliente",
            "cadastro-de-cedentes/:type": "cedente",
            "cadastro-de-volumes/:type": "volume",
            "cadastro-de-tipos-unidades/:type": "tipoUnidade",
            "cadastro-de-grupos/:type": "grupo",
            "cadastro-de-produtos/:type": "produto",
            "cadastro-de-usuarios/:type": "usuario",
            "cadastro-de-vendedores/:type":"vendedor",
            "compras/nota-fiscal/:type": "notaFiscalEntrada",
            "pedidos/cliente/:type": "pedidoCliente",
            "financeiro/contas-a-receber/:type": 'recebimento',
            "financeiro/contas-a-pagar/:type": 'pagamento',
            'sincronizacao/:type': 'sincronizacao',
            "ajuste-inventario/:type": "ajusteInventario",
            "repasses/ecommerce/:type": "repasses",
            "pedidos/fabrica/:type":"pedidoFabrica",
            "financeiro/cadastro-de-bancos/:type":"financeiroBanco",
            "financeiro/cadastro-de-agencias/:type":"financeiroAgencia",
            "financeiro/cadastro-de-contas-bancarias/:type":"financeiroContaBancaria",
            "financeiro/cadastro-de-cheques/:type(/:uuid)":"financeiroCheque"
        }
    }

    sincronizacao(type){

        closeMenuLeft()
        
        switch(type){
            case 'server-to-app':
                utils.SincronizacaoServiceUtil.asyncServerToApp()
                utils.UrlUtil.loadUrlBackbone('home')
                break
            case 'server-to-ecommerce':
                controller.SincronizacaoController.SincronizacaoEcommerce()
                break
                
        }
    }

    home() {
        closeMenuLeft()
        controller.HomeController.HomeView()
    }

    fabrica(type) {
        closeMenuLeft()

        switch (type) {
            case 'novo-cadastro':
                controller.FabricaController.FabricaView()
                break
            case 'pesquisa':
                controller.FabricaController.FabricaListView()
                break
        }
    }

    repasses(type){
        closeMenuLeft()

        switch (type) {
            case 'grupo-ecommerce':
                controller.GrupoController.GrupoListViewEcommerce()
                break
            case 'produto-ecommerce':
                controller.ProdutoController.ProdutoListViewEcommerce()
                break
        }

    }

    cliente(type) {
        closeMenuLeft()

        switch (type) {
            case 'novo-cadastro':
                controller.ClienteController.ClienteView()
                break
            case 'pesquisa':
                controller.ClienteController.ClienteListVew()
                break
        }
    }

    cedente(type) {
        closeMenuLeft()

        switch (type) {
            case 'novo-cadastro':
                controller.CadastroPessoaController.Cedente.CedenteView()
                break
            case 'pesquisa':
                controller.CadastroPessoaController.Cedente.CedenteListView()
                break
        }
    }

    vendedor(type) {
        closeMenuLeft()

        switch (type) {
            case 'novo-cadastro':
                controller.VendedorController.VendedorView()
                break
            case 'pesquisa':
                controller.VendedorController.VendedorListView()
                break
        }
    }

    ajusteInventario(type) {
        closeMenuLeft()

        switch (type) {
            case 'novo':
                controller.AjusteInventarioController.AjusteInventarioView()
                break
            case 'pesquisa':
                controller.AjusteInventarioController.AjusteInventarioListView()
                break
        }
    }

    volume(type) {
        closeMenuLeft()

        switch (type) {
            case 'novo-cadastro':
                controller.VolumeController.VolumeView()
                break
            case 'pesquisa':
                controller.VolumeController.VolumeListView()
                break
        }
    }

    tipoUnidade(type) {
        closeMenuLeft()

        switch (type) {
            case 'novo-cadastro':
                controller.TipoUnidadeController.TipoUnidadeView()
                break
            case 'pesquisa':
                controller.TipoUnidadeController.TipoUnidadeListView()
                break
        }

    }

    grupo(type) {
        closeMenuLeft()

        switch (type) {
            case 'novo-cadastro':
                controller.GrupoController.GrupoView()
                break
            case 'pesquisa':
                controller.GrupoController.GrupoListView()
                break
        }
    }

    financeiroBanco(type){
        closeMenuLeft()

        switch(type){
            case 'pesquisa':
                controller.FinanceiroController.Banco.BancoListView()
                break
        }
    }

    financeiroAgencia(type){
        closeMenuLeft()

        switch(type){
            case 'pesquisa':
                controller.FinanceiroController.Agencia.AgenciaListView()
                break
            case 'novo-cadastro':
                controller.FinanceiroController.Agencia.AgenciaView()
        }
    }

    financeiroCheque(type, uuid){
        closeMenuLeft()
        
            switch(type){
                case 'pesquisa':
                    controller.FinanceiroController.Cheque.ChequeListView()
                    break
                case 'novo-cadastro':
                    controller.FinanceiroController.Cheque.ChequeView()
                    break
                case 'view-cadastro':
                    if(uuid)
                        controller.FinanceiroController.Cheque.ChequeView({id : uuid}, {viewUrl : true} )
                    
        }
    }

    financeiroContaBancaria(type){
        closeMenuLeft()

        switch(type){
            case 'pesquisa':
                controller.FinanceiroController.ContaBancaria.ContaBancariaListView()
                break
            case 'novo-cadastro':
                controller.FinanceiroController.ContaBancaria.ContaBancariaView()
        }
    }


    produto(type) {
        closeMenuLeft()

        switch (type) {
            case 'novo-cadastro':
                controller.ProdutoController.ProdutoView()
                break
            case 'pesquisa':
                controller.ProdutoController.ProdutoListView()
                break
        }

    }

    usuario(type) {
        closeMenuLeft()
        switch (type) {
            case 'novo-cadastro':
                controller.UsuarioController.UsuarioView()
                break
            case 'pesquisa':
                controller.UsuarioController.UsuarioListView()
                break
        }
    }

    notaFiscalEntrada(type) {
        closeMenuLeft()


        switch (type) {
            case 'entrada':
                controller.NotafiscalEntrada.NotaFiscalEntradaView()
                break
            case 'pesquisa':
                controller.NotafiscalEntrada.NotaFiscalEntradaListView()
                break
        }

    }

    pedidoCliente(type) {
        closeMenuLeft()

        switch (type) {
            case 'novo':
                controller.PedidoCliente.PedidoClienteView()
                break
            case 'pesquisa':
                controller.PedidoCliente.PedidoClienteListView()
                break
        }
    }

    pedidoFabrica(type) {
        closeMenuLeft()

        switch (type) {
            case 'novo':
                controller.PedidoFabrica.PedidoFabricaView()
                break
            case 'pesquisa':
                controller.PedidoFabrica.PedidoFabricaListView()
                break
        }
    }


    recebimento(type, page, referencia) {
        closeMenuLeft()

        switch (type) {
            case 'nova':
                controller.FinanceiroController.Recebimento.RecebimentoView()
                //controller.RecebimentoController.ContaReceberView({ referencia: referencia })
                break
            case 'pesquisa':
                //controller.RecebimentoController.ContaReceberListView({ page: page })
                controller.FinanceiroController.Recebimento.RecebimentoListView()
                break
        }
    }

    pagamento(type, page, referencia) {
        closeMenuLeft()

        switch (type) {
            case 'nova':
                controller.FinanceiroController.Despesa.DespesaView()
                //controller.DespesaControlller.ContaPagarView({ referencia: referencia })
                break
            case 'pesquisa':
                controller.FinanceiroController.Despesa.DespesaListView()
                //controller.DespesaControlller.ContaPagarListView({ page: page })
                break
        }
    }

    logout() {

    }

}

module.exports = Router