const utils = require('../../../../helpers/_utils/utils')
const enumns = require('../enuns/enum')

module.exports = (sequelize, DataType) => {


    const Movimentacao = sequelize.define('Movimentacao', {
        id: { type: DataType.INTEGER, primaryKey: true, autoIncrement: true },
        observacao: { type: DataType.STRING, allowNull: true },
        fracao: {
            type: DataType.INTEGER,
            field: 'fracao',
            allowNull: false,
            defaultValue: 0
        },
        tipoUnidade: {
            type: DataType.ENUM,
            field: 'tipo_unidade',
            values: ['FARDO', 'UNITARIO'],
            allowNull: false,
            defaultValue: 'FARDO'
        },
        quantidade: {
            type: DataType.INTEGER,
            allowNull: false,
            validate: {
                notEmpty: { args: true, msg: 'Quantidade Obrigatória para o registro de movimentação!' },
            }
        },
        tipoMovimentacao: {
            type: DataType.ENUM, field: 'tipo_movimentacao',
            values: enumns.EnumTipoMovimentacao.map((item) => { return item.value }),
            allowNull: false,
            validate: {
                notEmpty: { args: true, msg: 'Tipo de movimentação obrigatória para o registro de movimentação!' },
            }
        }
    }, {
            timestamps: true,
            paranoid: true,
            underscored: true,
            freezeTableName: true,
            version: true,
            tableName: 'movimentacao'
        })


    Movimentacao.associate = models => {


        Movimentacao.belongsTo(models.Produto, {
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


        Movimentacao.belongsTo(models.NotaEntrada, {
            foreignKey: {
                name: 'notaEntradaId',
                allowNull: true,
                field: 'nota_entrada_id',
                validate: {
                    validateInterno(value) {
                        if (this.tipoMovimentacao == 'entrada_nota')
                            this.notaEntradaId = utils.MysqlUtil.validationInteger(value, 'Nota Entrada obrigatória')
                    }
                }
            }, targetKey: 'id', as: 'notaEntrada'
        })



        Movimentacao.belongsTo(models.PedidoCliente, {
            foreignKey: {
                name: 'pedidoClienteId',
                allowNull: true,
                field: 'pedido_cliente_id',
                validate: {
                    validateInterno(value) {
                        if (this.tipoMovimentacao == 'pedido_cliente')
                            this.pedidoClienteId = utils.MysqlUtil.validationInteger(value, 'Pedido obrigatório')
                    }
                }
            }, targetKey: 'id', as: 'pedidoCliente'
        })


        Movimentacao.belongsTo(models.Inventario, {
            foreignKey: {
                name: 'inventarioId',
                allowNull: true,
                field: 'inventario_id',
                validate: {
                    validateInterno(value) {
                        if (['saida_ajuste_estoque', 'entrada_ajuste_estoque'].indexOf(this.tipoMovimentacao) !== -1)
                            this.inventarioId = utils.MysqlUtil.validationInteger(value, 'Inventário obrigatório')
                    }
                }
            }, targetKey: 'id', as: 'inventario'
        })

        Movimentacao.belongsTo(models.Usuario, {
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

    }

    return Movimentacao
}

