const enumns = require('../enuns/enum')
const utils = require('../../../../helpers/_utils/utils')


module.exports = (sequelize, DataType) => {

    const Inventario = sequelize.define('Inventario', {
        id: { type: DataType.INTEGER, primaryKey: true, autoIncrement: true },
        observacao: {
            type: DataType.TEXT,
            field: 'observacao',
        },
        quantidade: {
            type: DataType.INTEGER,
            allowNull: false,
            validate: {
                notEmpty: { args: true, msg: 'Quantidade para o produto obrigatório' },
            }
        },
        operacao: {
            type: DataType.ENUM, values: enumns.EnumOperacaoInventario.map((item) => { return item.value }),
            allowNull: false,
            notEmpty: { args: true, msg: 'Operação obrigatória' },
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
            paranoid: true,
            underscored: true,
            freezeTableName: true,
            version: true,
            tableName: 'inventario',
            validate: {
            }


        })

    Inventario.associate = models => {

        Inventario.belongsTo(models.Produto, {
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


        Inventario.belongsTo(models.Usuario, {
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


    Inventario.prototype.toJSON = function () {
        return Object.assign({}, this.get())
    }

    return Inventario
}