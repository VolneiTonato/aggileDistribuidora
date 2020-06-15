const utils = require('../../../../helpers/_utils/utils')
const enumns = require('../enuns/enum')

/** PEDIDO */
module.exports = (sequelize, DataType) => {

    const PedidoCliente = sequelize.define('PedidoCliente', {
        id: { type: DataType.INTEGER, primaryKey: true, autoIncrement: true },
        total: {
            type: DataType.DECIMAL(10, 2),
            defaultValue: 0.00
        },
        dataEntrega: {
            type: DataType.DATE,
            field: 'data_entrega',
            set(value) {
                if (value)
                    this.setDataValue('dataEntrega', utils.DateUtil.formatPtbrToUniversal(value))
                else
                    this.setDataValue('dataEntrega', '')
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
        status: { type: DataType.ENUM, field: 'status', values: enumns.EnumStatusPedido.map((item) => { return item.value }), allowNull: false },
        observacao: { 
            type: DataType.TEXT,
            allowNull: true,
            get(){
                if(this.getDataValue('observacao') == null)
                    return ''
                return this.getDataValue('observacao')
            }
            
        },
        uuid: DataType.STRING,

    }, {
            timestamps: true,
            underscored: true,
            freezeTableName: true,
            version: true,
            tableName: 'pedidos_cliente',
            hook: true,
            hooks: {

            }
        })

    PedidoCliente.associate = models => {

        PedidoCliente.belongsTo(models.Pessoa, {
            foreignKey: {
                name: 'clienteId',
                allowNull: false,
                field: 'cliente_id',
                validate: {
                    validateInterno(value) {
                        this.clienteId = utils.MysqlUtil.validationInteger(value, 'Cliente obrigatório')
                    }
                }
            }, targetKey: 'id', as: 'clienteRef'
        })

        PedidoCliente.belongsTo(models.Usuario, {
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

        PedidoCliente.hasMany(models.ItemPedidoCliente, { as: 'itens', foreignKey: 'pedidoClienteId' })

        PedidoCliente.hasOne(models.Recebimento, {as: 'recebimento', foreignKey: 'pedidoClienteId'})


        /*
        PedidoCliente.belongsTo(vendedor, {
            foreignKey: {
                name: 'vendedorId',
                allowNull: false,
                field: 'usuario_id',
                validate: {
                    validateInterno(value) {
                        this.usuarioId = utils.MysqlUtil.validationInteger(value, 'Usuário obrigatório')
                    }
                }
            }, targetKey: 'id', as: 'usuario'
        })*/




    }

    PedidoCliente.beforeCreate(item => {
        if (item.uuid == undefined || (item.uuid.length == 0))
            item.uuid = utils.CryptUtil.uuid()
    })

    PedidoCliente.beforeUpdate(item => {
        if (item.uuid == undefined || (item.uuid.length == 0))
            item.uuid = utils.CryptUtil.uuid()
    })


    PedidoCliente.prototype.toJSON = function () {
        let data = Object.assign({}, this.get())

        return data
    }


    return PedidoCliente

}