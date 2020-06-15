const crud = require('../../../../models/aggile-admin/extras/includes/crud')
const aggileModels = require('../../../../models/aggile-admin/includes/produtoModel')
const utils = require('../../../../helpers/_utils/utils')
const Op = require('sequelize').Op
const AggileModel = require('../../../../models/aggile-admin/aggileAdminModel')

class ClienteModel {

    constructor() {

    }

   
    async clienteGeral(conditions = {}){

        if(utils.ObjectUtil.getValueProperty(conditions, 'municipioId'))
            conditions.endereco = { municipio : { id : conditions.municipioId } }

        if(utils.ObjectUtil.getValueProperty(conditions, 'clienteId'))
            conditions.id = conditions.clienteId

        conditions.forceReturn = true

        return await new AggileModel.ClienteModel().pesquisar(conditions)

    }


}


module.exports = ClienteModel