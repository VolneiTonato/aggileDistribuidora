const sequelize = require('./entityes/index')

module.exports = class MotivoDevolucaoChequeModel {

    constructor() {
        this._model = sequelize.entity.MotivoDevolucaoCheque
    }


    async findOne(conditions = {}) {

        let where = {
            where: conditions
        }

        return await this._model.findOne(where)
    }




    async findAll(conditions = {}){
        let where = { }

        if (conditions) {

            where = {
                where: conditions
            }
        }

        return await this._model.findAll(where)
    }


}