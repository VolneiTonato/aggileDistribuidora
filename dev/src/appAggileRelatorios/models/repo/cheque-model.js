const utils = require('../../../../helpers/_utils/utils')
const _ = require('lodash')
const AggileModel = require('../../../../models/aggile-admin/aggileAdminModel')

class ChequeModel {

    constructor() {

    }

    async chequeByMovimentacaoContas(conditions = {}) {

        
        const {chequeId} = conditions

        return await (await new AggileModel.ChequeModel()).obterContasVinculadasHistoricoCheque({chequeId})

    }

    



}


module.exports = ChequeModel