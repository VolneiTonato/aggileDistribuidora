const sequelize = require('./entityes/index')
const relation = require('./enuns/relation')
const utilModel = require('../extras/utils-model')

class BancoModel {

    constructor() {
        this._model = sequelize.entity.Banco
    }

    async pesquisar(conditions = {}) {
        let where = {}

        let query = {
            //include: relation().RelationCliente
        }

        if (Object.getOwnPropertyNames(where).length > 0)
            query.where = where


        if (conditions.paginator && ('limit' in conditions.paginator))
            query.limit = parseInt(conditions.paginator.limit)

        if (conditions.paginator && ('offset' in conditions.paginator))
            query.offset = parseInt(conditions.paginator.offset)

        if(conditions.orderColumn == 'true'){
            
        }


        return await this._model.findAll(query)
    }



    async createOrUpdate(data){
        let banco = {}

        let bancoUnique = await utilModel.CrudUtil.uniqueField(this._model, data.id, { codigo : data.codigo})

        if(bancoUnique)
            throw 'Código já cadastrado!'



        if(data.id){
            banco =  utilModel.LoadModelToFormUtil.load(new sequelize.entity.Banco(), data)

            let bancoExistente = await this._model.findOne({where : {id : banco.id}})

            if(!bancoExistente)
                throw 'Banco inválido'

            utilModel.LoadModelToFormUtil.setData(bancoExistente, banco, ['descricao', 'codigo'])

            banco = await bancoExistente.save({validate : true})

        }else{
            banco = await this._model.create(data)
        }

        return banco
    }



}

module.exports = BancoModel