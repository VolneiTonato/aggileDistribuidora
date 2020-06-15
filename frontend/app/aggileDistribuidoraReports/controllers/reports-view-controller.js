let masterController = require('./report-master-view-controller')


class PedidoReportView extends masterController {

    constructor(link) {
        super({link : link})
    }
}

class CompraReportView extends masterController{
    constructor(){ super({link : '#report-compra'})}
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
    PedidoReportView : ()  => { return new PedidoReportView('#report-pedido')},
    PedidoFabricaReportView : ()  => { return new PedidoReportView('#report-pedido-fabrica')},
    ProdutoReportView: () => {return new ProdutoReportView()},
    ReceitaReportView: () => { return new ReceitaReportView() },
    DespesaReportView: () => { return new DespesaReportView() },
    PlanilhaReporView: () => { return new PlanilhaReportView()},
    ClienteReportView: () => { return new ClienteReportView()},
    CompraReportView : () => { return new CompraReportView()}
    
}

