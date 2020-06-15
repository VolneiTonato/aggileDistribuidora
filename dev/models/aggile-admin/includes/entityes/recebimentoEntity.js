const enums = require('../enuns/enum')
const utils = require('../../../../helpers/_utils/utils')


module.exports = (sequelize, DataType) => {

    const Recebimento = sequelize.define('Recebimento', {
        id: { type: DataType.INTEGER, primaryKey: true, autoIncrement: true },
        descricao: {
            type: DataType.STRING,
            field: 'descricao',
            validate: {
                notEmpty: { args: true, msg: 'Descrição obrigatória!' },
                len: { args: [3, 255], msg: 'Descrição deve ter no mínimo 3 caracteres e no máximo 255!' }
            }
        },
        valor: {
            type: DataType.DOUBLE,
            field: 'valor',
            defaultValue: '0.00',
        },
        nf: {
            type: DataType.STRING,
            field: 'numero_nf',
            defaultValue: '0.00',
            set(value) {
                if (value == '')
                    this.setDataValue('nf', null)
                else
                    this.setDataValue('nf', value)
            }
        },
        saldo: {
            type: DataType.DOUBLE,
            field: 'saldo',
            defaultValue: '0.00'
        },
        status: {
            type: DataType.ENUM,
            allowNull: true,
            field: 'status_recebimento',
            values: enums.EnumStatusRecebimento.map((item) => { return item.value }),
            set(value) {
                if (value == '')
                    this.setDataValue('status', null)
                else
                    this.setDataValue('status', value)
            }
        },
        observacao: DataType.TEXT,
        valorPago: {
            type: DataType.VIRTUAL,
            get(){
                return utils.NumberUtil.numberFormat(utils.NumberUtil.diminuir(this.getDataValue('valor') ,this.getDataValue('saldo')),2)
            }
        }
        

    }, {
            timestamps: true,
            paranoid: true,
            underscored: true,
            freezeTableName: true,
            version: true,
            tableName: 'contas_a_receber',
            validate: {
            }


        })


    Recebimento.associate = models => {
        Recebimento.hasMany(models.HistoricoRecebimento, { as: 'historicos', foreignKey: 'recebimentoId', onDelete: 'cascade' })

        Recebimento.belongsTo(models.Pessoa, {
            foreignKey: {
                name: 'pessoaId',
                allowNull: true,
                field: 'pessoa_id',
                validate: {
                    validateInterno(value) {
                        this.clienteId = utils.MysqlUtil.validationInteger(value, 'Pessoa obrigatória')
                    }
                }
            }, targetKey: 'id', as: 'pessoa', onDelete: 'restrict'
        })




        Recebimento.belongsTo(models.PedidoCliente, {
            foreignKey: {
                name: 'pedidoClienteId',
                allowNull: true,
                field: 'pedido_cliente_id',
                unique: true,
                validate: {
                    validateInterno(value) {
                    }
                }
            }, targetKey: 'id', as: 'pedidoCliente', onDelete: 'restrict'

        })

    }

    Recebimento.prototype.toJSON = function () {
        return Object.assign({}, this.get())
    }

    return Recebimento

}