const utils = require('../../../../helpers/_utils/utils')

module.exports = (sequelize, DataType) => {

    const Banco = sequelize.define('Banco', {
        id: { type: DataType.INTEGER, primaryKey: true, autoIncrement: true },
        codigo: {
            type: DataType.STRING(30),
            unique: true,
            allowNull: false,
            validate: {
                notEmpty: { msg: 'Código obrigatório!' },
                notNull: { msg: 'Código obrigatório!' }

            }
        },
        descricao: {
            type: DataType.STRING,
            allowNull: false,
            validate: {
                notEmpty: { msg: 'Descrição obrigatória!' },
                notNull: { msg: 'Descrição obrigatória!' }
            }
        }
    }, {
        timestamps: true,
        paranoid: true,
        underscored: true,
        freezeTableName: true,
        tableName: 'bancos',
        version: true
    })


    Banco.prototype.toJSON = function () {
        return Object.assign({}, this.get())
    }

    return Banco

}