module.exports = (sequelize, DataType) => {

    const MotivoDevolucaoCheque = sequelize.define('MotivoDevolucaoCheque', {
        id: { type: DataType.INTEGER, primaryKey: true, autoIncrement: true },
        codigo: { type: DataType.INTEGER, allowNull: false },
        descricao: { type: DataType.STRING, allowNull: false }
    }, {
        timestamps: false,
        paranoid: true,
        underscored: true,
        freezeTableName: true,
        version: false,
        tableName: 'motivos_devolucao_cheques'
    })


    MotivoDevolucaoCheque.prototype.toJSON = function () {


        return Object.assign({}, this.get())
    }


    return MotivoDevolucaoCheque
}
