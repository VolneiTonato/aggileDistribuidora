module.exports = (sequelize, DataType) => {

    const Estado = sequelize.define('Estado', {
        id: { type: DataType.INTEGER, primaryKey: true, autoIncrement: true },
        descricao: { type: DataType.STRING, allowNull: false },
        uf: { type: DataType.STRING(3), allowNull: false },
        codigoIBGE: { type: DataType.INTEGER, field: 'codigo_ibge', allowNull: false }
    }, {
        timestamps: false,
        paranoid: true,
        underscored: true,
        freezeTableName: true,
        version: false,
        tableName: 'estados'
    })


    Estado.prototype.toJSON = function () {
        return Object.assign({}, this.get())
    }

    return Estado
}
