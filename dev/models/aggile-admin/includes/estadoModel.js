const sequelize = require('./entityes/index')

class EstadoModel {

    constructor(){
        this._model = sequelize.entity.Estado
    }

    

    
}

module.exports = EstadoModel