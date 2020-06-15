const utils = require('../../../../helpers/_utils/utils')

/** ITENS PEDIDO */

module.exports = (sequelize, DataType) => {

    const ItemPedidoFabrica = sequelize.define('ItemPedidoFabrica', {
        id: { type: DataType.INTEGER, primaryKey: true, autoIncrement: true },
        custo: {
            type: DataType.DECIMAL(10, 2),
            allowNull: false,
            validate: {
                notEmpty: { args: true, msg: 'Custo para o produto obrigatório!' },
            },
            field: 'custo'
        },
        peso: {
            type: DataType.DOUBLE,
            allowNull:false,
            defaultValue:0
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
            tableName: 'itens_pedidos_fabrica'
        })


    ItemPedidoFabrica.associate = models => {



        ItemPedidoFabrica.belongsTo(models.Produto, {
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


        ItemPedidoFabrica.belongsTo(models.PedidoFabrica, {
            foreignKey: {
                name: 'pedidoFabricaId',
                allowNull: false,
                field: 'pedido_fabrica_id',
                validate: {
                    validateInterno(value) {
                        this.pedidoFabricaId = utils.MysqlUtil.validationInteger(value, 'Pedido obrigatório')
                    }
                }
            }, targetKey: 'id', as: 'pedidoFabrica'
        })

    }


    ItemPedidoFabrica.prototype.toJSON = function () {
        return Object.assign({}, this.get())
    }

    return ItemPedidoFabrica
}