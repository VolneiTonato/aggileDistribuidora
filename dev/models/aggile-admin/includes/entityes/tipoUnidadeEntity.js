module.exports = (sequelize, DataType) => {

    const TipoUnidade = sequelize.define('TipoUnidade', {
        id: { type: DataType.INTEGER, primaryKey: true, autoIncrement: true },
        descricao: { type: DataType.STRING, allowNull: false },
    }, {
        timestamps: true,
        paranoid: true,
        underscored: true,
        freezeTableName: true,
        version: true,
        tableName: 'tipos_unidades'
    })


    TipoUnidade.prototype.toJSON = function () {

        return Object.assign({}, this.get())
    }


    return TipoUnidade

}