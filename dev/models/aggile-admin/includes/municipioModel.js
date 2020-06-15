const sequelize = require('./entityes/index')

class MunicipioModel {

    constructor() {
        this._model = sequelize.entity.Municipio
    }

}

module.exports = MunicipioModel