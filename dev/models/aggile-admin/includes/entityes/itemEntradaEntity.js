const utils = require('../../../../helpers/_utils/utils')

module.exports = (sequelize, DataType) => {

    const ItemEntrada = sequelize.define('ItemEntrada', {
        id: { type: DataType.INTEGER, primaryKey: true, autoIncrement: true },
        custo: {
            type: DataType.DECIMAL(10, 2),
            allowNull: false,
            validate: {
                notEmpty: { args: true, msg: 'Custo para o produto obrigatório!' },
            }
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
            version: true,
            tableName: 'itens_notas_entradas'
        })

    ItemEntrada.associate = models => {

        ItemEntrada.belongsTo(models.Produto, {
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


        ItemEntrada.belongsTo(models.NotaEntrada, {
            foreignKey: {
                name: 'notaEntradaId',
                allowNull: false,
                field: 'nota_entrada_id',
                validate: {
                    validateInterno(value) {
                        this.notaEntradaId = utils.MysqlUtil.validationInteger(value, 'Nota Entrada obrigatória')
                    }
                }
            }, targetKey: 'id', as: 'notaEntrada'
        })

    }


    ItemEntrada.prototype.toJSON = function () {
        
        return Object.assign({}, this.get())
    }

    return ItemEntrada
}