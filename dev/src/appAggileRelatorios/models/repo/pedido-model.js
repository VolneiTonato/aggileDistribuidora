const crud = require('../../../../models/aggile-admin/extras/includes/crud')
const utils = require('../../../../helpers/_utils/utils')
const _ = require('lodash')
const Op = require('sequelize').Op
const AggileModel = require('../../../../models/aggile-admin/aggileAdminModel')

class PedidoModel {

    constructor() {

    }


    async pedidosClienteGeral(conditions = {}) {

        if (conditions.municipioId)
            conditions.municipio = conditions.municipioId



        conditions.forceReturn = true
        conditions.status = conditions.statusPedido

        return await new AggileModel.PedidoClienteModel().pesquisar(conditions)

    }

    async romaneio(conditions = {}) {

        let values = {
            status: ['pendente', 'lancado']
        }
        let where = {
            pedidoPrincipal: '',
            quantidadeFD: '',
            quantidadeUN: ''
        }
        let join = {
            pedidoPrincipal: '',
            quantidadeFD: '',
            quantidadeUN: ''
        }
        let select = []        


        let joinCliente = (pedidoTable) => {
            return `JOIN clientes ON clientes.id = ${pedidoTable}.cliente_id 
                    JOIN enderecos ON enderecos.pessoa_id = clientes.id
                AND enderecos.tipo_pessoa = 'cliente'
                    AND enderecos.is_principal = 1
                AND enderecos.municipio_id IN (:municipioId) `
        }

        let dataBetween = (table) => {
            return ` AND ${table}.data_entrega BETWEEN :dataInicial AND :dataFinal `
        }



        if (conditions.dataInicial && conditions.dataFinal) {

            conditions.dataInicial = `${utils.DateUtil.formatPtbrToUniversal(conditions.dataInicial)} 00:00:00`
            conditions.dataFinal = `${utils.DateUtil.formatPtbrToUniversal(conditions.dataFinal)} 23:59:59`

            _.assign(values, { dataInicial: conditions.dataInicial, dataFinal: conditions.dataFinal })

            where.pedidoPrincipal = dataBetween('pedidos_cliente')
            where.quantidadeFD = dataBetween('pedido2')
            where.quantidadeUN = dataBetween('pedido3')

        }



        if (utils.ObjectUtil.getValueProperty(conditions, 'statusPedido')) {

            if (['pendente', 'lancado'].indexOf(conditions.statusPedido) === -1)
                throw 'Para o relatório de Romaneio, apenas selecione o status PENDENTE ou LANÇADO'

            values.status = [conditions.statusPedido]
        }




        if (utils.ObjectUtil.getValueProperty(conditions, 'municipiosId')) {
            join.pedidoPrincipal = joinCliente('pedidos_cliente')
            join.quantidadeFD = joinCliente('pedido2')
            join.quantidadeUN = joinCliente('pedido3')

            values.municipioId = conditions.municipiosId

        }



        let query = `SELECT produtos.descricao as produto, ${select.length > 0 ? select.join(',') + ',' : ''} produtos.referencia as referencia, produtos.id as id,
        produtos.peso as peso, produtos.fracao as fracao, 
        (
            select COALESCE(sum(item2.quantidade),0) FROM itens_pedidos_cliente item2 
                JOIN pedidos_cliente pedido2 ON pedido2.id = item2.pedido_cliente_id 
                JOIN produtos produto1 ON produto1.id = item2.produto_id

                ${utils.ObjectUtil.getValueProperty(conditions, 'fabricaId') ? ' AND produto1.fabrica_id = :fabricaId ': ''}

                ${utils.ObjectUtil.getValueProperty(conditions, 'consignado') ? ' AND pedido2.is_consignado = :consignado ' : ''}

                ${join.quantidadeFD}
            WHERE item2.produto_id = produtos.id 
                AND item2.tipo_unidade = :tipoUnidadeFD and pedido2.status = pedidos_cliente.status
                ${where.quantidadeFD}

        )as quantidadeFD,
        (
            select COALESCE(sum(item3.quantidade),0) FROM itens_pedidos_cliente item3
                JOIN pedidos_cliente pedido3 ON pedido3.id = item3.pedido_cliente_id 
                JOIN produtos produto2 ON produto2.id = item3.produto_id

                ${utils.ObjectUtil.getValueProperty(conditions, 'fabricaId') ? ' AND produto2.fabrica_id = :fabricaId' : ''}

                ${utils.ObjectUtil.getValueProperty(conditions, 'consignado') ? ' AND pedido3.is_consignado = :consignado ' : ''}

                ${join.quantidadeUN}
            WHERE item3.produto_id = produtos.id 
                AND item3.tipo_unidade = :tipoUnidadeUN and pedido3.status = pedidos_cliente.status
                ${where.quantidadeUN}
           
        )as quantidadeUN,
        sum(item.total) as total

        FROM itens_pedidos_cliente item
            JOIN pedidos_cliente ON pedidos_cliente.id = item.pedido_cliente_id
        JOIN produtos ON produtos.id = item.produto_id
            ${join.pedidoPrincipal}

            ${utils.ObjectUtil.getValueProperty(conditions, 'fabricaId') ? ' AND produtos.fabrica_id = :fabricaId' : ''}
            
            WHERE pedidos_cliente.status IN (:status)

            ${where.pedidoPrincipal}

            ${utils.ObjectUtil.getValueProperty(conditions, 'consignado') ? ' AND pedidos_cliente.is_consignado = :consignado ' : ''}

            GROUP BY produtos.descricao, produtos.referencia, produtos.fracao, produtos.id, produtos.peso
        ORDER BY produtos.descricao`



        _.assign(values, { tipoUnidadeFD: 'FARDO', tipoUnidadeUN: 'UNITARIO' })


        if(conditions.fabricaId)
            values.fabricaId = conditions.fabricaId

        if(conditions.consignado)
            values.consignado = utils.StringUtil.stringToBool(conditions.consignado) == true ? 1 : 0


        return await crud.query(query, values).catch(err => {console.log(err)})

    }



}


module.exports = PedidoModel