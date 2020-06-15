module.exports = (sequelize, DataType) => {

    const Volume = sequelize.define('Volume', {
        id: { type: DataType.INTEGER, primaryKey: true, autoIncrement: true },
        descricao: { type: DataType.STRING, unique: true }
    }, {
        timestamps: true,
        paranoid: true,
        underscored: true,
        freezeTableName: true,
        tableName: 'volumes',
        version: true
    })


    Volume.prototype.toJSON = function () {

        return Object.assign({}, this.get())
    }

    return Volume

}