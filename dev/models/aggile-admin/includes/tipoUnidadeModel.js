const sequelize = require('./entityes/index')
const utilModel = require('../extras/utils-model')
const utils = require('../../../helpers/_utils/utils')


class TipoUnidadeModel {

    constructor() {
        this._model = sequelize.entity.TipoUnidade
    }


    async pesquisar(conditions = {}) {
     

        let query = {}

        if (utils.ObjectUtil.getValueProperty(conditions,'paginator.limit'))
            query.limit = parseInt(conditions.paginator.limit)

        if (utils.ObjectUtil.getValueProperty(conditions,'paginator.offset'))
            query.offset = parseInt(conditions.paginator.offset)


        return await this._model.findAll(query)
    }




    async createOrUpdate(data = {}) {

        let tipoUnidade = {}

        let tipoUnidadeUnique = await utilModel.CrudUtil.uniqueField(this._model, data.id, { descricao: data.descricao })


        if (tipoUnidadeUnique)
            throw 'Descrição já cadastrada!'


        if (data.id) {
            tipoUnidade = utilModel.LoadModelToFormUtil.load(new sequelize.entity.TipoUnidade(), data)

            let tipoUnidadeExistente = await this._model.findOne({ where: { id: tipoUnidade.id } })

            if (!tipoUnidadeExistente)
                throw 'Tipo Inidade inválida'

            utilModel.LoadModelToFormUtil.setData(tipoUnidadeExistente, tipoUnidade, ['descricao'])

            tipoUnidade = await tipoUnidadeExistente.save({ validate: true })

        } else {
            tipoUnidade = await this._model.create(data)
        }

        return tipoUnidade

    }





}


module.exports = TipoUnidadeModel