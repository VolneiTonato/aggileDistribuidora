const sequelize = require('../../includes/entityes/index')
let _ = require('lodash')


class Crud {

    static async uniqueField(model, id, where = {}) {

        if (id)
            _.assign(where, { id: { [sequelize.Sequelize.Op.ne]: id } })

        return await model.findOne({ where: where })

    }

    static async query(sql = '', replacements = {}, options = {}) {

        options.type = sequelize.Sequelize.QueryTypes.SELECT
        

        if(Object.getOwnPropertyNames(replacements).length > 0)
            options.replacements = replacements

        return await sequelize.sequelize.queryInterface.sequelize.query(sql, options)

    }

    static async queryFindOne(sql = '', replacements = {}, options = {}){
        let data = await this.query(sql, replacements, options)

        if(Object.getOwnPropertyNames(data).length > 1)
            return data[0]
        return {}
    }


}


module.exports = Crud