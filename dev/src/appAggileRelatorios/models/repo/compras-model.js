const utils = require('../../../../helpers/_utils/utils')
const _ = require('lodash')
const AggileModel = require('../../../../models/aggile-admin/aggileAdminModel')

class CompraModel {

    constructor() {

    }

    async comprasGeral(conditions = {}) {

        conditions.forceReturn = true
        conditions.status = conditions.statusNota

        return await new AggileModel.NotaEntradaModel().pesquisar(conditions)

    }

    



}


module.exports = CompraModel