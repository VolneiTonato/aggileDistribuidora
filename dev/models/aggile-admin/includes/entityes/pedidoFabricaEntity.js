const utils = require('../../../../helpers/_utils/utils')
const enumns = require('../enuns/enum')

/** PEDIDO */
module.exports = (sequelize, DataType) => {

    const PedidoFabrica = sequelize.define('PedidoFabrica', {
        id: { type: DataType.INTEGER, primaryKey: true, autoIncrement: true },
        total: {
            type: DataType.DECIMAL(10, 2),
            defaultValue: 0.00
        },
        pesoTotal: {
            type: DataType.DOUBLE,
            defaultValue:0,
            allowNull: false,
            field: 'peso_total'
        },
        dataEntrega: {
            type: DataType.DATE,
            field: 'data_entrega',
            set(value) {
                if (value)
                    this.setDataValue('dataEntrega', utils.DateUtil.formatPtbrToUniversal(value))
                else
                    this.setDataValue('dataEntrega', null)
            },
            get() {
                let data = this.getDataValue('dataEntrega')

                if (data)
                    return utils.DateUtil.formatToPtBR(data)
            },
            validate: {
                isDate: { args: true, msg: 'Data Entrega obrigatória' }
            }
        },
        totalItens: {
            type: DataType.INTEGER,
            defaultValue: 0,
            field: 'total_itens'
        },
        isNF: { type: DataType.BOOLEAN, field: 'is_nf', defaultValue: false },
        consignado: { type: DataType.BOOLEAN, field: 'is_consignado', defaultValue: false },
        status: { type: DataType.ENUM, field: 'status', values: enumns.EnumStatusPedidoFabrica.map((item) => { return item.value }), allowNull: false },
        observacao: { type: DataType.TEXT },
        uuid: DataType.STRING,

    }, {
            timestamps: true,
            underscored: true,
            freezeTableName: true,
            version: true,
            tableName: 'pedidos_fabrica',
            hooks: {

            }
        })

    PedidoFabrica.associate = models => {

        PedidoFabrica.belongsTo(models.Pessoa, {
            foreignKey: {
                name: 'fabricaId',
                allowNull: false,
                field: 'fabrica_id',
                validate: {
                    validateInterno(value) {
                        this.fabricaId = utils.MysqlUtil.validationInteger(value, 'Fabrica obrigatória')
                    }
                }
            }, targetKey: 'id', as: 'pedidoFabrica'
        })

        PedidoFabrica.belongsTo(models.Usuario, {
            foreignKey: {
                name: 'usuarioId',
                allowNull: false,
                field: 'usuario_id',
                validate: {
                    validateInterno(value) {
                        this.usuarioId = utils.MysqlUtil.validationInteger(value, 'Usuário obrigatório')
                    }
                }
            }, targetKey: 'id', as: 'usuario'
        })

        PedidoFabrica.hasMany(models.ItemPedidoFabrica, { as: 'itens', foreignKey: 'pedidoFabricaId' })




    }

    PedidoFabrica.beforeCreate(item => {
        if (item.uuid == undefined || (item.uuid.length == 0))
            item.uuid = utils.CryptUtil.uuid()
    })

    PedidoFabrica.beforeUpdate(item => {
        if (item.uuid == undefined || (item.uuid.length == 0))
            item.uuid = utils.CryptUtil.uuid()
    })

    PedidoFabrica.prototype.toJSON = function () {

        return Object.assign({}, this.get())
    }


    return PedidoFabrica

}