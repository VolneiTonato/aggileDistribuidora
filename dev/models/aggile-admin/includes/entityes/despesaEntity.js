const enums = require('../enuns/enum')
const utils = require('../../../../helpers/_utils/utils')
const _ = require('lodash')


module.exports = (sequelize, DataType) => {

    const Despesa = sequelize.define('Despesa', {
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
        
        saldo: {
            type: DataType.DOUBLE,
            field: 'saldo',
            defaultValue: '0.00'
        },
   
        data: {
            type: DataType.VIRTUAL,
            get() {
                return utils.DateUtil.formatToPtBR(this.getDataValue('createdAt'))
            }
        },
      

        status: {
            type: DataType.ENUM,
            allowNull: true,
            field: 'status_pagamento',
            values: enums.EnumStatusDespesa.map((item) => { return item.value }),
            set(value) {
                if (value == '')
                    this.setDataValue('status', null)
                else
                    this.setDataValue('status', value)
            }
        },
        observacao: DataType.TEXT

    }, {
        timestamps: true,
        paranoid: true,
        underscored: true,
        freezeTableName: true,
        version: true,
        tableName: 'contas_a_pagar',
        validate: {
        }


    })


    Despesa.associate = models => {

        Despesa.hasMany(models.HistoricoDespesa, { as: { plural: 'historicos', singular: 'historico' }, constraints: false, foreignKey: { name: 'despesaId', field: 'contas_pagar_id', allowNull: false }, onDelete: 'cascade' })


        Despesa.belongsTo(models.Pessoa, {
            foreignKey: {
                name: 'pessoaId',
                allowNull: true,
                field: 'pessoa_id',
                set(value) {
                    this.setDataValue('pessoaId', utils.NumberUtil.isInt(value) === true ? value : null)
                }
            }, targetKey: 'id', as: 'pessoa', onDelete: 'restrict'
        })





        Despesa.belongsTo(models.NotaEntrada, {
            foreignKey: {
                name: 'notaEntradaId',
                allowNull: true,
                field: 'nota_entrada_id',
                validate: {

                }
            }, targetKey: 'id', as: 'notaEntrada', onDelete: 'restrict'

        })
    }

    Despesa.prototype.toJSON = function () {

        let data = Object.assign({}, this.get())

        if (data.historicos)
            data.historicos = _.orderBy(data.historicos, ['id'], ['asc'])

        return data
    }

    return Despesa
}