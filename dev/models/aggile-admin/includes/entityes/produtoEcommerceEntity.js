const utils = require('../../../../helpers/_utils/utils')

module.exports = (sequelize, DataType) => {

    const ProdutoEcommerce = sequelize.define('ProdutoEcommerce', {
        id: { type: DataType.INTEGER, primaryKey: true, autoIncrement: true },
        uuid: {
            type: DataType.UUID,
            unique: true
        },
        descricao: {
            type: DataType.STRING,
            allowNull: false,
            set(value) {
                if (value)
                    this.setDataValue('descricao', value.toUpperCase())
            },
            validate: {
                notEmpty: { args: true, msg: 'Descrição obrigatória!' },
            }
        },

        descricaoDetalhada: {
            type: DataType.STRING,
            allowNull: true,
            set(value) {
                if (value)
                    this.setDataValue('descricao detalhada', value.toUpperCase())
            }
        },
        precoVenda: {
            type: DataType.DECIMAL(10, 2),
            allowNull: false,
            field: 'preco_venda',
            defaultValue: '0.00',
            validate: {
                validateInterno(value) {
                    this.precoVenda = utils.MysqlUtil.validationDecimal(value, 'Preço de Venda obrigatório')
                }
            }
        },

        promocao: {
            type: DataType.DECIMAL(10, 2),
            allowNull: false,
            field: 'promocao',
            defaultValue: '0.00',
            validate: {
                validateInterno(value) {
                    this.promocao = utils.MysqlUtil.validationDecimal(value, 'Preço de Promocao obrigatório')
                }
            }
        },
        estoque: {
            type: DataType.INTEGER,
            field: 'estoque',
            allowNull: false,
            defaultValue: '0',
            validate: {
                validateInterno(value) {
                    this.estoque = utils.MysqlUtil.validationInteger(value, 'Estoque obrigatório')
                }
            }
        },
        descricaoDetalhada: {
            type: DataType.TEXT,
            field: 'descricao_detalhada'
        },
        isDestaque: {
            type: DataType.BOOLEAN,
            allowNull: true,
            defaulValue: false,
            field: 'is_destaque'
        },
        isEcommerce: {
            type: DataType.BOOLEAN,
            allowNull: true,
            defaulValue: false,
            field: 'is_ecommerce'
        }

    }, {
        timestamps: true,
        paranoid: true,
        underscored: true,
        freezeTableName: true,
        version: true,
        tableName: 'produtos_ecommerce'


    })

    ProdutoEcommerce.associate = models => {
        ProdutoEcommerce.hasOne(models.Produto, { as: 'produto', targetKey: 'id', foreignKey: { allowNull: true, name: 'produtoEcommerceId', field: 'produto_ecommerce_id' } })
    }


    ProdutoEcommerce.beforeCreate(item => {
        if (item.uuid == undefined || (item.uuid == 0))
            item.uuid = utils.CryptUtil.uuid()
    })

    ProdutoEcommerce.beforeUpdate(item => {
        if (item.uuid == undefined || (item.uuid == 0))
            item.uuid = utils.CryptUtil.uuid()
    })


    ProdutoEcommerce.prototype.toJSON = function () {

        return Object.assign({}, this.get())
    }


    return ProdutoEcommerce

}