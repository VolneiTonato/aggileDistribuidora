module.exports = (sequelize, DataType) => {
    const Grupo = sequelize.define('Grupo', {
        id: { type: DataType.INTEGER, primaryKey: true, autoIncrement: true },
        descricao: { type: DataType.STRING },
        breadCrumb: { type: DataType.TEXT, allowNull: true, field: 'bread_crumb' },
        childrens: DataType.VIRTUAL,
        parentsId: DataType.VIRTUAL
    }, {
            timestamps: true,
            paranoid: true,
            underscored: true,
            freezeTableName: true,
            tableName: 'grupos',
            version: true,

        })

    Grupo.associate = models => {
        Grupo.belongsTo(models.Grupo, {
            foreignKey: {
                name: 'grupoPaiId',
                allowNull: true,
                field: 'grupo_pai_id'
            }, targetKey: 'id', as: 'grupoPai'
        })

        Grupo.hasOne(models.GrupoEcommerce, { as: 'grupoEcommerce', foreignKey: { allowNull: false, name: 'grupoId', field: 'grupo_id' }, targetKey: 'id' })
    }


    Grupo.prototype.toJSON = function () {
        return Object.assign({}, this.get())
    }

    return Grupo
}