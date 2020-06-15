const sequelize = require('./entityes/index')
const utilModel = require('../extras/utils-model')
const utils = require('../../../helpers/_utils/utils')



class VolumeModel {

    constructor() {
        this._model = sequelize.entity.Volume
    }



    async pesquisar(conditions = {}) {
     

        let query = {}

        if (utils.ObjectUtil.getValueProperty(conditions,'paginator.limit'))
            query.limit = parseInt(conditions.paginator.limit)

        if (utils.ObjectUtil.getValueProperty(conditions,'paginator.offset'))
            query.offset = parseInt(conditions.paginator.offset)


        return await this._model.findAll(query)
    }

    

    async createOrUpdate(data){
        let volume = {}

        let volumeUnique = await utilModel.CrudUtil.uniqueField(this._model, data.id, { descricao : data.descricao})

        if(volumeUnique)
            throw 'Descrição já cadastrada!'



        if(data.id){
            volume =  utilModel.LoadModelToFormUtil.load(new sequelize.entity.Volume(), data)

            let volumeExistente = await this._model.findOne({where : {id : volume.id}})

            if(!volumeExistente)
                throw 'Volume inválido'

            utilModel.LoadModelToFormUtil.setData(volumeExistente, volume, ['descricao'])

            volume = await volumeExistente.save({validate : true})

        }else{
            volume = await this._model.create(data)
        }

        return volume
    }
}


module.exports = VolumeModel