const utils = require('../../../../helpers/_utils/utils')
const enumns = require('../enuns/enum')

/** credito cliente */

module.exports = (sequelize, DataType) => {

    const CreditoCliente = sequelize.define('CreditoCliente', {
        id: { type: DataType.INTEGER, primaryKey: true, autoIncrement: true },
        total: {
            type: DataType.DECIMAL(10, 2),
            defaultValue: 0.00
        },
        status: { type: DataType.ENUM, field: 'status', values: enumns.EnumStatusPedido.map((item) => { return item.value }), allowNull: false },
        observacao: { type: DataType.TEXT },
        uuid: DataType.STRING,

    }, {
            timestamps: true,
            underscored: true,
            freezeTableName: true,
            version: true,
            tableName: 'pedidos_cliente',
            hooks: {

            }
        })

    CreditoCliente.associate = models => {

        CreditoCliente.belongsTo(models.Cliente, {
            foreignKey: {
                name: 'clienteId',
                allowNull: false,
                field: 'cliente_id',
                validate: {
                    validateInterno(value) {
                        this.clienteId = utils.MysqlUtil.validationInteger(value, 'Cliente obrigatório')
                    }
                }
            }, targetKey: 'id', as: 'cliente'
        })

        CreditoCliente.belongsTo(models.Usuario, {
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

        CreditoCliente.belongsTo(models.PedidoCliente, {
            foreignKey: {
                name: 'pedidoClienteId',
                allowNull: false,
                field: 'pedido_cliente_id',
            }, targetKey: 'id', as: 'pedidoCliente'
        })

        CreditoCliente.hasMany(models.ItemPedidoCliente, { as: 'itens', foreignKey: 'pedidoClienteId' })

        CreditoCliente.hasOne(models.Recebimento, { as: 'recebimento', foreignKey: 'pedidoClienteId' })



    }

    CreditoCliente.beforeCreate(item => {
        if (item.uuid == undefined || (item.uuid.length == 0))
            item.uuid = utils.CryptUtil.uuid()
    })

    CreditoCliente.beforeUpdate(item => {
        if (item.uuid == undefined || (item.uuid.length == 0))
            item.uuid = utils.CryptUtil.uuid()
    })


    return CreditoCliente

}