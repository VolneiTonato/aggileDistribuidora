const _ = require('lodash')
const utils = require('../../../../helpers/_utils/utils')
const enumns = require('../enuns/enum')

const enumTipoEmissor = (enumns.EnumTipoPessoa.filter((item) => {
    if (['cliente', 'fabrica', 'cedente', 'vendedor'].indexOf(item.value) !== -1)
        return item
}).map((item) => { return item.value }))


const validateRegraNegocioNumber = (value, msg) => {
    if (!value || value <= 0)
        throw msg
}

module.exports = (sequelize, DataType) => {

    const Cheque = sequelize.define('Cheque', {
        id: { type: DataType.INTEGER, primaryKey: true, autoIncrement: true },
        valor: {
            type: DataType.DOUBLE,
            field: 'valor',
            set(value) {
                this.setDataValue('valor', utils.MysqlUtil.setDecimalValue(value))
            },
            validate: {
                regraNegocio(value) {
                    validateRegraNegocioNumber(value, 'Valor do cheque é obrigatório!')
                }
            }
        },
        numero: {
            type: DataType.DOUBLE,
            field: 'numero',
            set(value) {
                this.setDataValue('numero', utils.MysqlUtil.setDecimalValue(value))
            },
            validate: {
                regraNegocio(value) {
                    validateRegraNegocioNumber(value, 'Número do cheque é obrigatório!')
                }
            }
        },

        origemLancamento: {
            type: DataType.ENUM,
            field: 'origem_lancamento',
            allowNull: false,
            values: enumns.enumOrigemLancamentoCheque.map(row => { return row.value }),
            validate:{
                regraNegocio(value){
                    let item = _.find(enumns.enumOrigemLancamentoCheque, {value: value})
                    if(!item)
                        throw `É necessário informar a origem de lançamento do cheque!`
                }
            }

        },

        isTerceiro: {
            type: DataType.BOOLEAN,
            allowNull: false,
            field: 'is_terceiro'
        },

        tipoEmissor: {
            type: DataType.ENUM,
            values: enumTipoEmissor,
            field: 'tipo_emissor',
            allowNull: false,
            validate: {
                regraNegocio(value) {
                    if (enumTipoEmissor.indexOf(value) === -1)
                        throw 'Tipo Emissor inválido'
                }
            }
        },

        seq: {
            type: DataType.STRING(50),
            field: 'seq'
        },
        c1: {
            type: DataType.INTEGER(3),
            field: 'c1',
            set(value) {
                if (!value)
                    value = 0
                this.setDataValue('c1', value)
            }
        },
        c2: {
            type: DataType.INTEGER(3),
            field: 'c2',
            set(value) {
                if (!value)
                    value = 0
                this.setDataValue('c2', value)
            }

        },
        c3: {
            type: DataType.INTEGER(3),
            field: 'c3',
            set(value) {
                if (!value)
                    value = 0
                this.setDataValue('c3', value)
            }
        },

        serie: {
            type: DataType.STRING(10),
            field: 'serie',
            allowNull: false,
            validate: {
                notEmpty: { msg: 'Série obrigatória!' },
                notNull: { msg: 'Série obrigatória!' },
                regraNegocio(value) {
                    validateRegraNegocioNumber(value, 'Série obrigatória!')
                }
            }
        },
        nominal: {
            type: DataType.STRING(10),
            field: 'nominal',
            allowNull: true
        },

        comp: {
            type: DataType.DOUBLE,
            field: 'comp',
            allowNull: false,
            validate: {
                notEmpty: { msg: 'Comp. obrigatória!' },
                notNull: { msg: 'Comp. obrigatória!' }
            }
        },

        diasVencimento: {
            type: DataType.VIRTUAL,
            get() {
                let dias = 0
                try {
                    let dataEmissao = utils.DateUtil.getMoment(utils.DateUtil.formatPtbrToUniversal(this.dataEmissao))
                    let dataPreDatado = utils.DateUtil.getMoment(utils.DateUtil.formatPtbrToUniversal(this.dataPreDatado))

                    dias = Math.abs(parseInt(utils.DateUtil.getInstanceMoment().duration(dataEmissao.diff(dataPreDatado)).asDays()))
                } catch (err) {

                }

                this.setDataValue('diasVencimento', dias)
            }

        },

        lastHistorico: {
            type: DataType.VIRTUAL,
            get() {
                if (_.isArray(this.historicos))
                    this.setDataValue('lastHistorico', _.last(this.historicos))
                else
                    this.setDataValue('lastHistorico', null)

                return this.getDataValue('lastHistorico')

            }
        },

        status: {
            type: DataType.VIRTUAL,
            get() {



                if (_.isArray(this.historicos)) {

                    this.historicos = _.orderBy(this.historicos, ['id'], ['asc'])

                    this.setDataValue('status', _.get(_.last(this.historicos), 'status'))
                }

                return this.getDataValue('status')
            }
        },

        dataEmissao: {
            type: DataType.DATEONLY,
            field: 'data_emissao',
            allowNull: false,
            set(value) {

                if (value)
                    this.setDataValue('dataEmissao', utils.DateUtil.formatPtbrToUniversal(value))
                else
                    this.setDataValue('dataEmissao', null)
            },
            get() {
                let data = this.getDataValue('dataEmissao')

                if (data)
                    return utils.DateUtil.formatToPtBR(data)
            },
            validate: {

                notEmpty: { msg: 'Data Emissão obrigatória!' },
                notNull: { msg: 'Data Emissão obrigatória!' },

                regraNegocio(value) {
                    if (!value)
                        throw `Data Emissão é obrigatória`
                }
            }
        },

        dataPreDatado: {
            type: DataType.DATEONLY,
            field: 'data_pre_datado',
            allowNull: true,
            set(value) {

                if (value)
                    this.setDataValue('dataPreDatado', utils.DateUtil.formatPtbrToUniversal(value))
                else
                    this.setDataValue('dataPreDatado', null)
            },
            get() {
                let data = this.getDataValue('dataPreDatado')

                if (data)
                    return utils.DateUtil.formatToPtBR(data)
            }
        }

    }, {
        timestamps: true,
        paranoid: true,
        underscored: true,
        freezeTableName: true,
        version: true,
        tableName: 'cheques',
        hook: true,
        hooks: {

        },
        validate: {
            regraNegorico() {
                if ([false, true].indexOf(this.isTerceiro) === -1)
                    throw 'Obrigatório informar se o cheque é de terceiro ou não!'
            },

            vencimentoCheque() {
                if (this.dataEmissao && this.dataPreDatado) {
                    let dataEmissao = utils.DateUtil.getMoment(utils.DateUtil.formatPtbrToUniversal(this.dataEmissao))
                    let dataPreDatado = utils.DateUtil.getMoment(utils.DateUtil.formatPtbrToUniversal(this.dataPreDatado))

                    let diff = Math.abs(parseInt(utils.DateUtil.getInstanceMoment().duration(dataEmissao.diff(dataPreDatado)).asDays()))

                    if (isNaN(diff))
                        diff = 180

                    if (diff > 180)
                        throw `Cheque está inutilizável! Passou de 6 meses da data de emissão.`
                }
            }

        }


    })


    Cheque.associate = models => {


        Cheque.belongsTo(models.ContaBancaria, {
            foreignKey: {
                name: 'contaBancariaId',
                allowNull: false,
                field: 'conta_bancaria_id',
                validate: {
                    validateInterno(value) {
                        this.contaBancariaId = utils.MysqlUtil.validationInteger(value, 'Conta bancária obrigatória')
                    },
                    regraNegocio(value) {
                        validateRegraNegocioNumber(value, 'Conta Bancária obrigatória!')
                    }
                }
            }, targetKey: 'id', as: 'contaBancaria'
        })

        Cheque.belongsTo(models.Pessoa, {
            foreignKey: {
                name: 'emissorId',
                allowNull: false,
                field: 'emissor_id',
                validate: {
                    validateInterno(value) {
                        this.emissorId = utils.MysqlUtil.validationInteger(value, 'Emissor obrigatória')
                    },
                    regraNegocio(value) {
                        validateRegraNegocioNumber(value, 'Emissor obrigatório!')
                    }
                }
            }, targetKey: 'id', as: 'emissor'
        })

        Cheque.hasMany(models.HistoricoCheque, { as: 'historicos', foreignKey: 'chequeId' })
    }




    Cheque.prototype.toJSON = function () {
        let data = Object.assign({}, this.get())

        if (data.historicos)
            data.historicos = _.orderBy(data.historicos, ['id'], ['asc'])

        return data
    }

    return Cheque
}

