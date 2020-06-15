const crud = require('../../../../models/aggile-admin/extras/includes/crud')
const utils = require('../../../../helpers/_utils/utils')
const _ = require('lodash')
const Op = require('sequelize').Op
const AggileModel = require('../../../../models/aggile-admin/aggileAdminModel')

class ReceitaModel {

    constructor() {

    }


    async recebimentos(conditions = {}){

        if(conditions.municipioId)
            conditions.municipio = conditions.municipioId

        conditions.forceReturn = true
        conditions.status  = conditions.statusReceita

        return await new AggileModel.RecebimentoModel().pesquisar(conditions)

    }


}


module.exports = ReceitaModel