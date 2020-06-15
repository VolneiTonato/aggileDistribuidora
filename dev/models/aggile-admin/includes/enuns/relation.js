const sequelize = require('../entityes/index')
const _ = require('lodash')

let entity = sequelize.entity


let relationEndereco = () => {

    return [{
        model: entity.Municipio, as: 'municipio', require: true, include: [
            { model: entity.Estado, as: 'estado', require: true }
        ]
    }]
}


let relationProdutoEcommerce = () => {
    return [{
        model: entity.Produto, as: 'produto', include: relationProduto()
    }]
}

let relationGrupoEcommerce = () => {
    return [
        { model: entity.Grupo, as: 'grupo', include: relationGrupo() }
    ]
}

let relationGrupo = () => {
    return [
        { model: entity.Grupo, as: 'grupoPai' },
        { model: entity.GrupoEcommerce, as: 'grupoEcommerce', required: false }
    ]
}

let relationProduto = () => {
    return [
        { model: entity.Volume, as: 'volume' },
        { model: entity.TipoUnidade, as: 'tipoUnidade' },
        { model: entity.Grupo, as: 'grupo', include: relationGrupo() },
        { model: entity.Pessoa, as: 'pessoa', include: relationPessoa(['fabrica']) },
        { model: entity.ProdutoEcommerce, as: 'produtoEcommerce', required: false },

    ]
}


let relationItemToProduto = () => {
    return [
        { model: entity.Produto, as: 'produto', include: relationProduto() }
    ]
}


let relationItemNotaFiscal = () => {
    return [
        { model: entity.ItemEntrada, as: 'itens', separate: true, include: relationItemToProduto() }
    ]
}

let relationItemPedidoFabrica = () => {
    return [
        { model: entity.ItemPedidoFabrica, separate: true, as: 'itens', include: relationItemToProduto() },
    ]
}

let relationItemPedido = () => {
    return [
        { model: entity.ItemPedidoCliente, separate: true, as: 'itens', include: relationItemToProduto() },
    ]
}

let relationNotaEntrada = () => {
    return [
        { model: entity.ItemEntrada, as: 'itens', separate: true, include: relationItemToProduto() },
        { model: entity.Pessoa, as: 'pessoaFabrica', include: relationPessoa(['fabrica']) },
    ]
}

let relationPedidoFabrica = () => {
    return [
        { model: entity.ItemPedidoFabrica, as: 'itens', include: relationItemToProduto() },
        { model: entity.Pessoa, as: 'pedidoFabrica', include: relationPessoa(['fabrica']) },
        { model: entity.Usuario, as: 'usuario', attributes: ['id', 'permissao', 'nome'] },
    ]
}

let relationPedido = () => {
    return [
        { model: entity.ItemPedidoCliente, separate: true, as: 'itens', include: relationItemToProduto() },
        { model: entity.Pessoa, as: 'clienteRef', include: relationPessoa(['cliente']) },
        { model: entity.Usuario, as: 'usuario', attributes: ['id', 'permissao', 'nome'] },
    ]
}

let relationRecebimentoPedido = () => {
    return [
        { model: entity.Recebimento, as: 'recebimento', include: relationRecebimento() }
    ]
}

let relationHistoricosRecebimento = (includeConta = false, type) => {
    let defaults = [
        { model: entity.Usuario, as: 'usuario', attributes: ['id', 'permissao', 'nome'] },
        { model: entity.Cheque, as: 'cheque', required: false, include: relationCheque() },
    ]

    if(includeConta == true){
        if(type == 'despesa')
            defaults.push({model: entity.Despesa, as: 'despesa'})
        else if(type == 'receita'){
            defaults.push({model: entity.Recebimento, as: 'recebimento'})
        }
    }

    return defaults
}


let relationDespesa = () => {
    return [
        { model: entity.NotaEntrada, as: 'notaEntrada', include: relationNotaEntrada(), required:false },
        { model: entity.Pessoa, as: 'pessoa', include: relationPessoa(['cliente','fabrica','vendedor','cedente']) },
        { model: entity.HistoricoDespesa, separate: true, as: 'historicos', include: relationHistoricosRecebimento() }
    ]
}

let relationRecebimento = () => {
    return [
        { model: entity.PedidoCliente, as: 'pedidoCliente', include: relationPedido() },
        { model: entity.HistoricoRecebimento, as: 'historicos', separate: true, include: relationHistoricosRecebimento() },
        { model: entity.Pessoa, as: 'pessoa', include: relationPessoa(['cliente','fabrica','vendedor','cedente']) },
    ]
}



let relationVendedor = () => {
    let relation = relationPessoaBy()

    return _.concat(relation, { model: entity.Usuario, as: 'usuario', attributes: ['id', 'permissao', 'nome'] })
}


let relationAgencia = () => {
    let relation = relationPessoaBy()

    return _.concat(relation, { model: entity.Banco, as: 'banco' })
}

let relationContaBancaria = () => {



    let relation = [
        { model: entity.Pessoa, as: 'pessoa', include: relationPessoa(), required: false },
        { model: entity.Pessoa, as: 'pessoaAgencia', include: relationPessoa(['agencia']) },
        { model: entity.Telefone, separate: true, as: 'telefones', required: false }
    ]

    return relation
}

let relationCheque = () => {

    let relation = [
        { model: entity.Pessoa, as: 'emissor', include: relationPessoa(['cliente','fabrica','cedente','vendedor']), required: true },
        { model: entity.ContaBancaria, as: 'contaBancaria', include: relationContaBancaria(), required: false },
        { model: entity.HistoricoCheque, separate: true, as: 'historicos', include: relationHistoricosCheque() }
    ]

    return relation
}


let relationHistoricosCheque = () => {
    return [
        { model: entity.Usuario, as: 'usuario', attributes: ['id', 'permissao', 'nome'] },
        { model: entity.MotivoDevolucaoCheque, as: 'motivoDevolucao', required: false },
        { model: entity.ContaBancaria, include: relationContaBancaria(), as: 'contaBancaria', required: false },
        { model: entity.Pessoa, include: relationPessoa(['cliente','fabrica','cedente','vendedor']), as: 'pessoaRepasse', required: false }
    ]
}


let relationPessoa = (type = []) => {


    let defaults = [
        { model: entity.Endereco, separate: true, as: 'enderecos', include: relationEndereco(), required: false },
        { model: entity.Telefone, separate: true, as: 'telefones', required: false },
    ]

    let outhers = [
        { model: entity.Cliente, as: 'cliente', required: false, include : relationPessoaBy() },
        { model: entity.Fabrica, as: 'fabrica', required: false , include : relationPessoaBy()},
        { model: entity.Cedente, as: 'cedente', required: false , include : relationPessoaBy()},
        { model: entity.Agencia, as: 'agencia', required: false , include : relationAgencia()},
        { model: entity.Vendedor, as: 'vendedor', required: false, include : relationVendedor() }
    ]

    if (type.length == 0)
        defaults = _.union(defaults, outhers)

    else if(type.length == 1)
        defaults = _.union(defaults, outhers.filter(item => {
            if(type.indexOf(item.as) !== -1)
                item.required = true
                return item

        }))
    else
        defaults = _.union(defaults, outhers.filter(item => {
            if (type.indexOf(item.as) !== -1){
                return item
            }
        }))

    
    return defaults
}


let relationPessoaBy = () => {
    return [
        {
            model: entity.Pessoa, as: 'pessoa', include: [
                { model: entity.Endereco, separate:true, as: 'enderecos', include: relationEndereco(), required: false },
                { model: entity.Telefone, separate:true, as: 'telefones', required: false },
            ]
        }
    ]
}



module.exports = () => {
    return {
        RelationPessoa: (types) => { return relationPessoa(types)},
        RelationCliente: relationPessoaBy(),
        RelationCedente: relationPessoaBy(),
        RelationFabrica: relationPessoaBy(),
        RelationAgencia: relationAgencia(),
        RelationContaBancaria: relationContaBancaria(),
        RelationVendedor: relationVendedor(),
        RelationGrupo: relationGrupo(),
        relationGrupoEcommerce: relationGrupoEcommerce(),
        RelationProduto: relationProduto(),
        RelationProdutoEcommerce: relationProdutoEcommerce(),
        RelationPedido: { Pedido: relationPedido(), Itens: relationItemToProduto(), ItemPedido: relationItemPedido(), Recebimento: relationRecebimentoPedido() },
        RelationPedidoFabrica: { Pedido: relationPedidoFabrica(), Itens: relationItemToProduto(), ItemPedido: relationItemPedidoFabrica() },
        RelationNotaEntrada: { Nota: relationNotaEntrada(), Itens: relationItemToProduto(), ItemNota: relationItemNotaFiscal() },
        RelationFinanceiroReceita: {
            Receita: relationRecebimento(), Historicos: relationHistoricosRecebimento(true, 'receita')
        },
        RelationFinanceiroDespesa: {
            Despesa: relationDespesa(), Historicos: relationHistoricosRecebimento(true, 'despesa')
        },
        RelationItemToProduto: relationItemToProduto(),
        RelationEndereco: relationEndereco(),
        RelationCheque: {
            Cheque: relationCheque(), Historico: relationHistoricosCheque()
        }
    }

}