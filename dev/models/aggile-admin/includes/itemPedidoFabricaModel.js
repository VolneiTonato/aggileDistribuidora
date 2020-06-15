const sequelize = require('./entityes/index')
const utilModel = require('../extras/utils-model')
const _ = require('lodash')
const utils = require('../../../helpers/_utils/utils')

module.exports = class ItemPedidoFabricaModel {

    constructor() {
        this._model = sequelize.entity.ItemPedidoFabrica
    }


    async saveItemPedido(data = {}) {

        let itemPedido = utilModel.LoadModelToFormUtil.load(new sequelize.entity.ItemPedidoFabrica(), _.clone(data))

        if (itemPedido.isBonificado == true)
            itemPedido.total = 0.00
        else if (itemPedido.tipoUnidade == 'UNITARIO' && data.produto.fracao > 1)
            itemPedido.total = (itemPedido.custo / data.produto.fracao) * itemPedido.quantidade
        else
            itemPedido.total = itemPedido.quantidade * itemPedido.custo

        itemPedido.peso = utils.NumberUtil.multiplicacao(data.produto.peso, itemPedido.quantidade)


        return await itemPedido.save({ validate: true })
    }

    async removeItemPedido(data = {}) {

        if (data.numero && data.removeAll == true)
            return await this._model.destroy({ where: { pedidoFabricaId: data.numero } })
        else if (data.produtoId && data.pedidoFabricaId && data.id)
            return await this._model.destroy({ where: { pedidoFabricaId: data.pedidoFabricaId, produtoId: data.produtoId, id: data.id } })
        else
            throw "Parametro inválido para remover item!"

    }
}
