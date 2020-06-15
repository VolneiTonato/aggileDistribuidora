const sequelize = require('./entityes/index')
const utilModel = require('../extras/utils-model')
const _ = require('lodash')


module.exports = class ItemPedidoClienteModel {

    constructor() {
        this._model = sequelize.entity.ItemPedidoCliente
    }


    async saveItemPedido(data = {}) {

        let itemPedido = utilModel.LoadModelToFormUtil.load(new sequelize.entity.ItemPedidoCliente(), _.clone(data))

        if (itemPedido.isBonificado == true)
            itemPedido.total = 0.00
        else if (itemPedido.tipoUnidade == 'UNITARIO' && data.produto.fracao > 1)
            itemPedido.total = (itemPedido.precoVenda / data.produto.fracao) * itemPedido.quantidade
        else
            itemPedido.total = itemPedido.quantidade * itemPedido.precoVenda

        return await itemPedido.save({ validate: true })
    }

    async removeItemPedido(data = {}) {

        if (data.numero && data.removeAll == true)
            return await this._model.destroy({ where: { pedidoClienteId: data.numero } })
        else if (data.produtoId && data.pedidoClienteId && data.id)
            return await this._model.destroy({ where: { pedidoClienteId: data.pedidoClienteId, produtoId: data.produtoId, id: data.id } })
        else
            throw "Parametro inválido para remover item!"

    }
}