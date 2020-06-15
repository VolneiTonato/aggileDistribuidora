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
            'home': 'home',
            'report-pedidos(/?:parameters)': 'pedido',
            'report-pedidos-fabrica(/?:parameters)': 'pedidoFabrica',
            'report-produtos(/?:parameters)': 'produto',
            'report-receitas(/?:parameters)': 'receita',
            'report-despesas(/?:parameters)': 'despesa',
            'report-planilhas(/?:parameters)': 'planilha',
            'report-clientes(/?:parameters)': 'cliente',
            'report-compras(/?:parameters)':'compra'
        }
    }

    initialize(){
        
    }

    home() {
        closeMenuLeft()
        controller.HomeController.HomeView()
    }

    compra(parameters){
        closeMenuLeft()
        controller.ReportController.CompraReportView()
    }

    pedido(parameters){
        closeMenuLeft()
        controller.ReportController.PedidoReportView()
    }

    pedidoFabrica(parameters){
        closeMenuLeft()
        controller.ReportController.PedidoFabricaReportView()
    }

    receita(parameters){
        closeMenuLeft()
        controller.ReportController.ReceitaReportView()
    }

    despesa(parameters){
        closeMenuLeft()
        controller.ReportController.DespesaReportView()
    }

    planilha(parameters){
        closeMenuLeft()
        controller.ReportController.PlanilhaReporView()
    }

    produto(parameters){
        closeMenuLeft()
        controller.ReportController.ProdutoReportView()
    }

    cliente(parameters){
        closeMenuLeft()
        controller.ReportController.ClienteReportView()
    }

}

module.exports = Router