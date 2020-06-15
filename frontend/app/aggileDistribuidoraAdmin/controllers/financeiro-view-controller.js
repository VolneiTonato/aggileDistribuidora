module.exports = {
    Banco : {
        BancoListView : () => { return new (require('./includes/financeiro/bancos/banco-list-view'))() },
    },
    Agencia: {
        AgenciaListView: () => { return new (require('./includes/financeiro/agencia/agencia-list-view'))() },
        AgenciaView: () => { return new (require('./includes/financeiro/agencia/agencia-view'))() }
    },
    ContaBancaria: {
        ContaBancariaListView: () => { return new (require('./includes/financeiro/conta-bancaria/conta-bancaria-list-view'))() },
        ContaBancariaView: () => { return new (require('./includes/financeiro/conta-bancaria/conta-bancaria-view'))() },
    },
    Recebimento: {
        RecebimentoListView: () => { return new (require('./includes/financeiro/recebimento/receita-list-view'))() },
        RecebimentoView: () => { return new (require('./includes/financeiro/recebimento/receita-view'))() }
    },
    Despesa: {
        DespesaListView: () => { return new (require('./includes/financeiro/despesa/despesa-list-view'))() },
        DespesaView: () => { return new (require('./includes/financeiro/despesa/despesa-view'))() }
    },
    Cheque:{
        ChequeListView: () => { return new (require('./includes/financeiro/cheque/cheque-list-view'))() },
        ChequeView: (data, options) => { return new (require('./includes/financeiro/cheque/cheque-view'))(data, options) }
    }

}