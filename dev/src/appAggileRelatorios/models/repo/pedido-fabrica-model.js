const crud = require('../../../../models/aggile-admin/extras/includes/crud')
const utils = require('../../../../helpers/_utils/utils')
const _ = require('lodash')
const Op = require('sequelize').Op
const AggileModel = require('../../../../models/aggile-admin/aggileAdminModel')

class PedidoFabricaModel {

    constructor() {

    }


    async pedidosFabricaGeral(conditions = {}) {

        if (conditions.municipioId)
            conditions.municipio = conditions.municipioId



        conditions.forceReturn = true
        conditions.status = conditions.statusPedido

        return await new AggileModel.PedidoFabricaModel().pesquisar(conditions)

    }

}


module.exports = PedidoFabricaModel