const utils = require('../../../../helpers/_utils/utils')

/** ITENS PEDIDO */

module.exports = (sequelize, DataType) => {

    const ItemPedidoCliente = sequelize.define('ItemPedidoCliente', {
        id: { type: DataType.INTEGER, primaryKey: true, autoIncrement: true },
        precoVenda: {
            type: DataType.DECIMAL(10, 2),
            allowNull: false,
            validate: {
                notEmpty: { args: true, msg: 'Preço de venda para o produto obrigatório!' },
            },
            field: 'preco_venda'
        },
        total: {
            type: DataType.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.00
        },
        quantidade: {
            type: DataType.INTEGER,
            allowNull: false,
            validate: {
                notEmpty: { args: true, msg: 'Quantidade para o produto obrigatório' },
            }
        },
        isBonificado: {
            type: DataType.BOOLEAN,
            defaultValue: false,
            field: 'is_bonificacao'
        },
        tipoUnidade: {
            type: DataType.ENUM,
            field: 'tipo_unidade',
            values: ['FARDO', 'UNITARIO'],
            allowNull: false,
            defaultValue: 'FARDO'
        }

    }, {
            timestamps: true,
            underscored: true,
            freezeTableName: true,
            version: true,
            tableName: 'itens_pedidos_cliente'
        })


    ItemPedidoCliente.associate = models => {



        ItemPedidoCliente.belongsTo(models.Produto, {
            foreignKey: {
                name: 'produtoId',
                allowNull: false,
                field: 'produto_id',
                validate: {
                    validateInterno(value) {
                        this.produtoId = utils.MysqlUtil.validationInteger(value, 'Produto obrigatório')
                    }
                }
            }, targetKey: 'id', as: 'produto'
        })


        ItemPedidoCliente.belongsTo(models.PedidoCliente, {
            foreignKey: {
                name: 'pedidoClienteId',
                allowNull: false,
                field: 'pedido_cliente_id',
                validate: {
                    validateInterno(value) {
                        this.pedidoClienteId = utils.MysqlUtil.validationInteger(value, 'Pedido obrigatório')
                    }
                }
            }, targetKey: 'id', as: 'pedidoCliente'
        })

    }


    ItemPedidoCliente.prototype.toJSON = function () {
        let data = Object.assign({}, this.get())

        return data
    }

    return ItemPedidoCliente
}