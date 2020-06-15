const utils = require('../../../../helpers/_utils/utils')
const enumns = require('../enuns/enum')


module.exports = (sequelize, DataType) => {

    const NotaEntrada = sequelize.define('NotaEntrada', {
        id: { type: DataType.INTEGER, primaryKey: true, autoIncrement: true },
        numero: DataType.STRING,
        status: { type: DataType.ENUM, values: enumns.EnumStatusNotaFiscal.map((item) => { return item.value }), allowNull: false },
        data: {
            type: DataType.DATE,
            field: 'data',
            set(value) {

                if (value) {
                    if (utils.DateUtil.isValid(value))
                        this.setDataValue('data', utils.DateUtil.formatPtbrToUniversal(value))
                    else
                        this.setDataValue('data', value)
                } else {
                    this.setDataValue('data', '')
                }

            },

            get() {
                let data = this.getDataValue('data')

                if (data)
                    if (utils.DateUtil.isValid(data, 'YYYY-MM-DD'))
                        return utils.DateUtil.formatToPtBR(data)
                    else
                        return data
            },
            validate: {
                validateDate(value) {

                    let status = ['pendente', 'cancelada', 'finalizada'].toString().indexOf(this.getDataValue('status'))



                    let isValid = utils.DateUtil.isValid(value, 'YYYY-MM-DD')



                    if (status > -1 && value !== undefined && !isValid)
                        throw new Error('Data inválida')
                    else if (status == -1 && value == undefined && !isValid)
                        throw new Error('Data obrigatória')
                    else if (status == -1 && value !== undefined && !isValid)
                        throw new Error('Data inválida')
                    else if (status > -1 && value === undefined)
                        this.setDataValue('data', null)

                }
            }
        },
        total: {
            type: DataType.DECIMAL(10, 2),
            defaultValue: 0.00
        },
        totalItens: {
            type: DataType.INTEGER,
            defaultValue: 0,
            field: 'total_itens'
        },
        isNF: {
            type: DataType.BOOLEAN,
            defaultValue: false,
            field: 'is_nf'
        },
        chaveAcessoNF: {
            type: DataType.STRING,
            allowNull: true,
            field: 'chave_acesso_nf',
            validate: {
                validateChaveAcessoNF() {
                    if (this.chaveAcessoNF && (this.chaveAcessoNF.length != 44))
                        throw new Error('Chave de acesso NFe precisa de 44 dígitos.')
                }
            }
        }


    }, {
            timestamps: true,
            underscored: true,
            version: true,
            tableName: 'notas_entradas'
        })


    NotaEntrada.associate = models => {

        NotaEntrada.belongsTo(models.Pessoa, {
            foreignKey: {
                name: 'fabricaId',
                allowNull: false,
                field: 'fabrica_id',
                validate: {
                    validateInterno(value) {
                        this.fabricaId = utils.MysqlUtil.validationInteger(value, 'Fábrica obrigatória')
                    }
                }
            }, targetKey: 'id', as: 'pessoaFabrica'
        })

        NotaEntrada.belongsTo(models.Usuario, {
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

        NotaEntrada.hasMany(models.ItemEntrada, { as: 'itens', foreignKey: 'notaEntradaId', onDelete: 'cascade' })

    }


    NotaEntrada.prototype.toJSON = function () {
        return Object.assign({}, this.get())
    }

//    NotaEntrada.sequelize.query('SET SQL_BIG_SELECTS=1')

    return NotaEntrada

}