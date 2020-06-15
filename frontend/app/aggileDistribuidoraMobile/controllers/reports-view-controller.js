let masterController = require('./report-master-view-controller')


class PedidoReportView extends masterController {

    constructor() {
        super({link : '#report-pedido'})
    }
}


class ReceitaReportView extends masterController{
    constructor(){
        super({link : '#report-receita'})
    }

}


class DespesaReportView extends masterController{
    constructor(){
        super({link : '#report-despesa'})
    }
}


class PlanilhaReportView extends masterController{
    constructor(){
        super({link : '#report-planilha'})
    }
}


class ProdutoReportView extends masterController{
    constructor(){
        super({link : '#report-produto'})
    }

}


class ClienteReportView extends masterController{
    constructor(){
        super({link : '#report-cliente'})
    }

}


module.exports = {
    PedidoReportView : ()  => { return new PedidoReportView()},
    ProdutoReportView: () => {return new ProdutoReportView()},
    ReceitaReportView: () => { return new ReceitaReportView() },
    DespesaReportView: () => { return new DespesaReportView() },
    PlanilhaReporView: () => { return new PlanilhaReportView()},
    ClienteReportView: () => { return new ClienteReportView()}
    
}

