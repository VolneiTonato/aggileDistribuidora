const utils = require('../../../../helpers/_utils/utils')
const enums = require('../enuns/enum')

module.exports = (sequelize, DataType) => {
    const Produto = sequelize.define('Produto', {
        id: { type: DataType.INTEGER, primaryKey: true, autoIncrement: true },
        descricao: {
            type: DataType.STRING,
            allowNull: false,
            set(value) {
                this.setDataValue('descricao', value.toUpperCase())
            },
            validate: {
                notEmpty: { args: true, msg: 'Descrição obrigatória!' },
            }
        },
        
        status:{
            type: DataType.BOOLEAN,
            allowNull: false,
            defaultValue: true,
            validate: {
                notEmpty: { args: true, msg: 'Status obrigatório!' },
            }

        },
        custo: {
            type: DataType.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: '0.00',
            validate: {
                validateInterno(value) {
                    this.custo = utils.MysqlUtil.validationDecimal(value, 'Custo obrigatório')
                }
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
        comissao: {
            type: DataType.DECIMAL(10, 2),
            allowNull: true,
            defaultValue: '0.00'
        },
        peso: {
            type: DataType.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: '0.00',
            validate: {
                validateInterno(value) {
                    this.peso = utils.MysqlUtil.validationDecimal(value, 'Peso obrigatório')
                }
            }
        },
        altura: {
            type: DataType.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: '0.00',
            validate: {
                validateInterno(value) {
                    this.altura = utils.MysqlUtil.validationDecimal(value, 'Altura obrigatório')
                }
            }
        },
        largura: {
            type: DataType.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: '0.00',
            validate: {
                validateInterno(value) {
                    this.largura = utils.MysqlUtil.validationDecimal(value, 'Largura obrigatório')
                }
            }
        },
        comprimento: {
            type: DataType.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: '0.00',
            validate: {
                validateInterno(value) {
                    this.comprimento = utils.MysqlUtil.validationDecimal(value, 'Comprimento obrigatório')
                }
            }
        },
        referencia: {
            type: DataType.STRING
        },
        unidadePorEmbalagem: {
            type: DataType.INTEGER,
            field: 'unidade_por_embalagem',
            allowNull: false,
            defaultValue: '1',
            validate: {
                validateInterno(value) {
                    this.unidadePorEmbalagem = utils.MysqlUtil.validationInteger(value, 'Unidade por Embalagem obrigatório')
                }
            }
        },
        graduacaoAlcoolica: {
            type: DataType.DECIMAL(10, 2),
            field: 'graduacao_alcoolica',
            allowNull: false,
            defaultValue: '0.00',
            validate: {
                validateInterno(value) {
                    this.graduacaoAlcoolica = utils.MysqlUtil.validationDecimal(value, 'Graduação Alcoólica obrigatório')
                }
            }
        },
        estoqueAtual: {
            type: DataType.INTEGER,
            field: 'estoque_atual',
            allowNull: false,
            defaultValue: '0',
            validate: {
                validateInterno(value) {
                    this.estoqueAtual = utils.MysqlUtil.validationInteger(value, 'Estoque obrigatório')
                }
            }
        },
        estoqueUnitario: {
            type: DataType.INTEGER,
            field: 'estoque_unitario',
            allowNull: false,
            defaultValue: '0'
        },
        margemLucro: {
            type: DataType.DECIMAL(10, 2),
            field: 'margem_lucro',
            allowNull: true,
            defaultValue: 0.00
        },
        fracao: {
            type: DataType.INTEGER,
            field: 'fracao',
            allowNull: false,
            defaultValue: 0
        },
        estoque: {
            type: DataType.VIRTUAL,
            get() {
                return `${this.estoqueAtual},${this.estoqueUnitario}`
            }
        },
        custoUnitario: {
            type: DataType.VIRTUAL,
            get() {
                return utils.NumberUtil.cdbl(utils.NumberUtil.divisao(this.custo, this.fracao))
            }
        },
        precoVendaUnitario: {
            type: DataType.VIRTUAL,
            get() {
                return utils.NumberUtil.cdbl(utils.NumberUtil.divisao(this.precoVenda, this.fracao))
            }
        },
        pesoUnitario: {
            type: DataType.VIRTUAL,
            get() {
                return utils.NumberUtil.cdbl(utils.NumberUtil.divisao(this.peso, this.fracao))
            }
        },

        descricaoDetalhada: {
            type: DataType.TEXT,
            field: 'descricao_detalhada'
        }

    }, {
            timestamps: true,
            paranoid: true,
            underscored: true,
            freezeTableName: true,
            version: true,
            tableName: 'produtos'


        })

    Produto.associate = models => {

        Produto.belongsTo(models.Pessoa, {
            foreignKey: {
                name: 'fabricaId',
                allowNull: false,
                field: 'fabrica_id',
                validate: {
                    validateInterno(value) {
                        this.fabricaId = utils.MysqlUtil.validationInteger(value, 'Fábrica obrigatória')
                    }
                }
            }, targetKey: 'id', as: 'pessoa'
        })


        Produto.belongsTo(models.Volume, {
            foreignKey: {
                name: 'volumeId',
                allowNull: false,
                field: 'volume_id',
                validate: {
                    validateInterno(value) {
                        this.volumeId = utils.MysqlUtil.validationInteger(value, 'Volume obrigatório')
                    }
                }
            }, targetKey: 'id', as: 'volume'
        })


        Produto.belongsTo(models.TipoUnidade, {
            foreignKey: {
                name: 'tipoUnidadeId',
                allowNull: false,
                field: 'tipo_unidade_id',
                validate: {
                    validateInterno(value) {
                        this.tipoUnidadeId = utils.MysqlUtil.validationInteger(value, 'Tipo Unidade obrigatório')
                    }
                }
            }, targetKey: 'id', as: 'tipoUnidade'
        })



        Produto.belongsTo(models.Grupo, {
            foreignKey: {
                name: 'grupoId',
                allowNull: false,
                field: 'grupo_id',
                validate: {
                    validateInterno(value) {
                        this.grupoId = utils.MysqlUtil.validationInteger(value, 'Grupo obrigatório')
                    }
                }
            }, targetKey: 'id', as: 'grupo'
        })

        Produto.hasOne(models.ProdutoEcommerce, { as: 'produtoEcommerce', foreignKey: { allowNull: false, name: 'produtoId', field: 'produto_id' }, targetKey: 'id' })

    }



    Produto.prototype.toJSON = function () {
        let data = Object.assign({}, this.get())

        return data
    }

    return Produto
}