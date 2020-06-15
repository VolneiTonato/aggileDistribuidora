const utils = require('../../../../helpers/_utils/utils')

module.exports = (sequelize, DataType) => {


    const Municipio = sequelize.define('Municipio', {
        id: { type: DataType.INTEGER, primaryKey: true, autoIncrement: true },
        descricao: { type: DataType.STRING, allowNull: false },
        codigoIBGE: { type: DataType.INTEGER, field: 'codigo_ibge', allowNull: false }
    }, {
            timestamps: false,
            paranoid: true,
            underscored: true,
            freezeTableName: true,
            version: false,
            tableName: 'municipios'
        })

    Municipio.associate = models => {

        Municipio.belongsTo(models.Estado, {
            foreignKey: {
                name: 'estadoId',
                allowNull: false,
                field: 'estado_id',
                validate: {
                    validateInterno(value) {
                        this.municipioId = utils.MysqlUtil.validationInteger(value, 'Estado obrigatório')
                    }
                }
            }, targetKey: 'id', as: 'estado'
        })

    }

    return Municipio
}