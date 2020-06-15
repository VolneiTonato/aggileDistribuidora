const enumTipoEstabelecimentoCliente = [
    {text: 'Mercado', value:'mercado', id : 1},
    {text: 'Restaurante', value:'restaurante', id: 2},
    {text: 'Lancheria', value:'lancheria', id: 3},
    {text: 'Pizzaria', value:'pizzaria', id: 4},
    {text: 'Bar', value:'bar', id: 5},
    {text: 'Conveniência', value: 'conveniencia', id: 6}
]

const enumTipoMovimentacao = [
    {text: 'Entrada de Nota', value: 'entrada_nota', id: 1},
    {text: 'Ajuste de estoque Entrada', value: 'entrada_ajuste_estoque', id: 2}, 
    {text: 'Pedido Cliente', value: 'pedido_cliente', id: 3},
    {text: 'Cancelamento Pedido Cliente', value: 'cancelamento_pedido_cliente', id:4},
    {text: 'Estorno Pedido Cliente', value: 'estorno_pedido_cliente', id: 5},
    {text: 'Cancelamento Entrada de Nota', value: 'cancelamento_entrada_nota', id:6},
    {text: 'Estorno Entrada de Nota', value: 'estorno_entrada_nota', id:7},
    {text: 'Ajuste de estoque Saída', value: 'saida_ajuste_estoque', id: 8}, 
    {text: 'Contagem de Estoque', value: 'contagem_de_estoque', id: 8}, 
    {text: 'Entrada Ajuste Estoque Automatica', value: 'entrada_ajuste_estoque_automatica', id: 9},
    {text: 'Saída Ajuste Estoque Automatica', value: 'saida_ajuste_estoque_automatica', id: 10},

]

const enumFormaPagamento = [
    {value: 'cheque', text: 'Cheque', id: 1},
    {value: 'cheque_pre', text: 'Cheque Pré', id: 2},
    {value: 'dinheiro', text: 'Dinheiro', id: 3},
    {value: 'boleto_a_vista', text: 'Boleto à Vista', id: 4},
    {value: 'boleto_a_prazo', text: 'Boleto a Prazo', id: 5},
    {value: 'deposito', text: 'Depósito', id:6},
    {value: 'recibo', text: 'Recibo', id:7},
    {value: 'cartao_debito', text: 'Cartão Débito', id:8},
    {value: 'cartao_credito', text: 'Cartão Crédito', id:9},

]

const enumStatusRecebimento = [
    {value: 'paga', text: 'Paga', id:1},
    {value: 'aberta', text: 'Aberta', id:2},
    {value: 'pendente', text: 'Pendente', id:3},
    {value: 'cancelada', text: 'Cancelada', id:4},
    {value: 'devedor', text: 'Devedor', id:5},
    {value: 'cartorio', text: 'Cartório', id:6},
    {value: 'estornada', text: 'Estornada', id:7}


]


const enumStatusDespesa = [
    {value: 'paga', text: 'Paga', id:1},
    {value: 'aberta', text: 'Aberta', id:2},
    {value: 'pendente', text: 'Pendente', id:3},
    {value: 'cancelada', text: 'Cancelada', id:4},
    {value: 'estornada', text: 'Estornada', id:5}
]


const enumStatusCheque = [
    {text : 'Pendente', value: 'pendente', id: 1},
    {text : 'Depositado', value: 'depositado', id: 2},
    {text : 'Aguardando Depósito', value: 'aguardando_depositado', id: 3},
    {text : 'Devolvido', value: 'devolvido', id: 4},
    {text : 'Cancelado', value: 'cancelado', id: 7},
    {text : 'Repassado', value: 'repassado', id: 8},
    {text: 'Recebido', value: 'recebido', id:9},
    {text: 'Repasse Pagamento', value: 'repasse_pagamento', id:10},
]


const enumPermissaoUsuario = [
    { text: 'Vendedor', value: 'vendedor', id:1 },
    { text: 'Administrador', value: 'administrador', id:2 },
    { text: 'Representante', value: 'representante', id:3 },
    { text: 'Usuário', value: 'usuario', id:4 }
]

const enumStatusPedido = [
    {text: 'Pendente', value: 'pendente', id:1},
    {text: 'Lançado', value: 'lancado', id:2},
    {text: 'Cancelado', value: 'cancelado', id:3},
    {text: 'Entregue', value: 'entregue', id:4}
]

const enumStatusPedidoFabrica = [
    {text: 'Pendente', value: 'pendente', id:1},
    {text: 'Lançado', value: 'lancado', id:2},
    {text: 'Cancelado', value: 'cancelado', id:3}
]

const enumStatusNotaFiscal = [
    {text: 'Pendente', value: 'pendente', id: 1},
    {text: 'Lançada', value: 'lancada', id: 2},
    {text: 'Cancelada', value: 'cancelada', id:3},
    {text: 'Finalizada', value: 'finalizada', id: 4}
]

const enumTipoUnidadePedido = [
    {text: 'FARDO', value: 'fardo' , id: 1},
    {text: 'UNITÁRIO', value: 'unitario', id: 2}
]

const enumOperacaoInventario = [
    {text: 'Entrada', value : 'entrada', id : 1},
    {text: 'Saída', value : 'saida', id : 2},
    {text: 'Contagem de Estoque', value : 'contagem_de_estoque', id : 3},

]

let enumTipoPessoa = [
    {text: 'Cliente', value: 'cliente', id: 1},
    {text: 'Fábrica', value: 'fabrica', id: 2},
    {text: 'Vendedor', value: 'vendedor', id: 3},
    {text: 'Agencia', value: 'agencia', id: 4},
    {text: 'Cedente', value: 'cedente', id: 5},

]

//const enumTipoPessoaTelfone = _.concat()

const enumStatusCadastro = [
    {text: 'Ativo', value: true, id: 1},
    {text: 'Inativo', value: false, id: 2}
]

const enumOrigemLancamentoCheque = [
    {text: 'Receita', value:'receita', id:1},
    {text: 'Despesa', value: 'despesa', id:2}
]

module.exports = {
    EnumTipoEstabelecimentoCliente : enumTipoEstabelecimentoCliente,
    EnumTipoMovimentacao : enumTipoMovimentacao,
    EnumPermissaoUsuario: enumPermissaoUsuario,
    EnumFormaPagamento: enumFormaPagamento,
    EnumStatusRecebimento: enumStatusRecebimento,
    EnumStatusPedido: enumStatusPedido,
    EnumStatusNotaFiscal: enumStatusNotaFiscal,
    EnumOperacaoInventario: enumOperacaoInventario,
    EnumStatusDespesa: enumStatusDespesa,
    EnumTipoPessoa: enumTipoPessoa,
    EnumStatusCadastro: enumStatusCadastro,
    EnumStatusCheque: enumStatusCheque,
    enumOrigemLancamentoCheque: enumOrigemLancamentoCheque,
    EnumStatusPedidoFabrica: enumStatusPedidoFabrica
}