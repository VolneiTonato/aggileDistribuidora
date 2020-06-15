const utils = require('../../../../helpers/_utils/utils')

module.exports = (sequelize, DataType) => {
    const GrupoEcommerce = sequelize.define('GrupoEcommerce', {
        id: { type: DataType.INTEGER, primaryKey: true, autoIncrement: true },
        uuid: {type: DataType.UUID},
        descricao: { 
            type: DataType.STRING,
            validate: {
                notEmpty: { args: true, msg: 'Descrição obrigatória!' },
            }
        },
        descricaoDetalhada: { type: DataType.STRING, allowNull : true, field: 'descricao_detalhada' },
        breadCrumb: { type: DataType.TEXT, allowNull: true, field: 'bread_crumb' },
        ordemMenuEcommerce: {
            type: DataType.INTEGER,
            allowNull: true,
            defaulValue:0,
            field: 'ordem_menu_ecommerce',
            set(value){
                this.setDataValue('ordemMenuEcommerce', utils.NumberUtil.cInt(value))
            },
            validate: {
                notEmpty: { args: true, msg: 'ordem obrigatória!' },
            }
        },
        isPrincipalMenuEcommerce: {
            type: DataType.BOOLEAN,
            allowNull: true,
            defaulValue: false,
            field: 'is_principal_menu_ecommerce',
            validate: {
                notEmpty: { args: true, msg: 'Principal obrigatória!' },
            }
        },
        isEcommerce: {
            type: DataType.BOOLEAN,
            allowNull: true,
            defaulValue: false,
            field: 'is_ecommerce',
            validate: {
                notEmpty: { args: true, msg: 'ecommerce obrigatória!' },
            }
        },

        link: {
            type: DataType.STRING,
            allowNull: true
        },
        breadCrumbLink:{
            type: DataType.STRING,
            allowNull:true,
            field: 'bread_crumb_link'
        }

    }, {
            timestamps: true,
            paranoid: false,
            underscored: true,
            freezeTableName: true,
            tableName: 'grupos_ecommerce',
            version: true,

        })

    GrupoEcommerce.associate = models => {
        GrupoEcommerce.hasOne(models.Grupo, { as: 'grupo', targetKey: 'id', foreignKey: { allowNull: true, name: 'grupoEcommerceId', field: 'grupo_ecommerce_id' } })
    }


    GrupoEcommerce.beforeCreate(item => {
        if (item.uuid == undefined || (item.uuid == 0))
            item.uuid = utils.CryptUtil.uuid()
    })

    GrupoEcommerce.beforeUpdate(item => {
        if (item.uuid == undefined || (item.uuid == 0))
            item.uuid = utils.CryptUtil.uuid()
    })


    GrupoEcommerce.prototype.toJSON = function () {
        return Object.assign({}, this.get())
    }

    return GrupoEcommerce
}