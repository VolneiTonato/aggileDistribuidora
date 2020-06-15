const sequelize = require('./entityes/index')
const utils = require('../../../helpers/_utils/utils')
const utilModel = require('../extras/utils-model')
const _ = require('lodash')

module.exports = class ItemEntradaModel {

    constructor() {
        this._model = sequelize.entity.ItemEntrada
    }

    async saveItemNota(data) {

        let itemEntrada = utilModel.LoadModelToFormUtil.load(new sequelize.entity.ItemEntrada(), _.clone(data))

        
        if (itemEntrada.isBonificado == true)
            itemEntrada.total = 0.00
        else if (itemEntrada.tipoUnidade == 'UNITARIO' && data.produto.fracao > 1)
            itemEntrada.total = utils.NumberUtil.cdbl((itemEntrada.custo / data.produto.fracao) * itemEntrada.quantidade)
        else
            itemEntrada.total = utils.NumberUtil.cdbl(utils.NumberUtil.multiplicacao(itemEntrada.quantidade, itemEntrada.custo))

        return await itemEntrada.save({ validate: true })


    }

    async removeItemNota(data = {}) {

        

        if (data.nf && data.removeAll == true)
            return await this._model.destroy({ where: { notaEntradaId: data.nf }})
        else if (data.produtoId && data.notaEntradaId && data.id)
            return await this._model.destroy({ where: { notaEntradaId: data.notaEntradaId, produtoId: data.produtoId, id: data.id }})
        else
            throw "Parametro inválido para remover item!"

    }
}