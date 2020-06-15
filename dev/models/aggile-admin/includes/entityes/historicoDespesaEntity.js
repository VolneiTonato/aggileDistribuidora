const enums = require('../enuns/enum')
const utils = require('../../../../helpers/_utils/utils')

module.exports = (sequelize, DataType) => {


    const HistoricoDespesa = sequelize.define('HistoricoDespesa', {
        id: { type: DataType.INTEGER, primaryKey: true, autoIncrement: true },
        valor: {
            type: DataType.DECIMAL(10,2),
            field: 'valor',
            set(value) {
                this.setDataValue('valor', utils.MysqlUtil.setDecimalValue(value))
            }
        },
        juro: {
            type: DataType.DECIMAL(10,2),
            field: 'juro',
            set(value) {
                this.setDataValue('juro', utils.MysqlUtil.setDecimalValue(value))
            }
        },
        juroPercentual: {
            type: DataType.VIRTUAL,
            get() {
                if (this.getDataValue('juro') > 0)
                    return Math.abs(utils.NumberUtil.calcularVariacaoMenorParaMaior(utils.NumberUtil.sum(this.getDataValue('valor'), this.getDataValue('juro')), this.getDataValue('valor')))
                return 0.00
            }
        },
        desconto: {
            type: DataType.DECIMAL(10,2),
            field: 'desconto',
            set(value) {
                this.setDataValue('desconto', utils.MysqlUtil.setDecimalValue(value))
            }
        },
        descontoPercentual: {
            type: DataType.VIRTUAL,
            get() {
                if (this.getDataValue('desconto') > 0)
                    return Math.abs(utils.NumberUtil.calcularVariacaoMaiorParaMenor(this.getDataValue('valor'), this.getDataValue('valor') - this.getDataValue('desconto')))
                return 0.00
            }
        },

        troco: {
            type: DataType.DECIMAL(10,2),
            field: 'troco',
            set(value) {
                this.setDataValue('troco', utils.MysqlUtil.setDecimalValue(value))
            },
            valueDefault: 0.00
        },

        valorTotal: {
            type: DataType.DECIMAL(10,2),
            field: 'valor_total',
            set(value) {
                this.setDataValue('valorTotal', utils.NumberUtil.cdbl(value))
            }
        },
        vencimento: {
            type: DataType.DATEONLY,
            field: 'vencimento',
            set(value) {

                if (value)
                    this.setDataValue('vencimento', utils.DateUtil.formatPtbrToUniversal(value))
                else
                    this.setDataValue('vencimento', '')
            },
            get() {
                let data = this.getDataValue('vencimento')

                if (data)
                    return utils.DateUtil.formatToPtBR(data)
            },
            validate: {
                isDate: { args: true, msg: 'Data de Vencimento obrigatória' }
            }
        },
        dataPagamento: {
            type: DataType.DATEONLY,
            field: 'data_pagamento',
            set(value) {
                if (value)
                    this.setDataValue('dataPagamento', utils.DateUtil.formatPtbrToUniversal(value))
                else
                    this.setDataValue('dataPagamento', null)
            },
            get() {
                let data = this.getDataValue('dataPagamento')

                if (data)
                    return utils.DateUtil.formatToPtBR(data)
            },
            validate: {
                isDate: { args: true, msg: 'Data de pagamento obrigatória' }
            }
        },
      

        valorRecebido: {
            type:DataType.DECIMAL(10,2),
            set(value){
                this.setDataValue('valorRecebido', utils.NumberUtil.cdbl(value))
            },
            field:'valor_recebido',
            valueDefault: 0.00
            
        },

        valorLiquido: {
            type: DataType.VIRTUAL,
            get() {
                let valorPago = this.getDataValue('valorPago')
                let desconto = this.getDataValue('desconto')
                let juro = this.getDataValue('juro')
                let troco = this.getDataValue('troco')

                let juroAndTroco = juro >= troco ? utils.NumberUtil.diminuir(juro, troco) : utils.NumberUtil.diminuir(troco, juro)


                let total = utils.NumberUtil.sum(desconto, utils.NumberUtil.diminuir(valorPago, Math.abs(juroAndTroco)))


                this.setDataValue('valorLiquido', total)

                return this.getDataValue('valorLiquido')
            }
        },

        dataBomPara: {
            type: DataType.DATEONLY,
            field: 'data_bom_para',
            set(value) {



                if (value)
                    this.setDataValue('dataBomPara', utils.DateUtil.formatPtbrToUniversal(value))
                else
                    this.setDataValue('dataBomPara', null)
            },
            get() {
                let data = this.getDataValue('dataBomPara')

                if (data)
                    return utils.DateUtil.formatToPtBR(data)
            },
            validate: {

                regraNegocio(value) {
                    if (['cheque_pre', 'recibo', 'boleto_a_prazo', 'deposito'].indexOf(this.getDataValue('formaPagamento')) != -1 && !value)
                        throw `Data bom para é obrigatória para a forma de lançamento ${this.getDataValue('formaPagamento')} `
                }

                // isDate: { args: true, msg: 'Data de data bom para é obrigatória' }
            }
        },

        formaPagamento: {
            type: DataType.ENUM,
            field: 'forma_pagamento',
            values: enums.EnumFormaPagamento.map((item) => { return item.value }),
            validate: {

                regraNegocio(value) {

                    if (this.getDataValue('status') == 'paga' && !value)
                        throw 'Forma de pagamento obrigatória!'
                }
            }

        },
        status: {
            type: DataType.ENUM,
            field: 'status_pagamento',
            values: enums.EnumStatusDespesa.map((item) => { return item.value }),
            set(value) {
                if (value == '')
                    this.setDataValue('status', 'aberta')
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
        tableName: 'historico_contas_a_pagar',
        validate: {
            regraNegocioCheque() {

                if (['cheque', 'cheque_pre'].indexOf(this.formaPagamento) !== -1 && (!utils.NumberUtil.cdbl(this.chequeId) > 0 && this.status != 'estornada'))
                    throw `Para lançar a despesa com Cheque ou Cheque Pré, será necessário informar um cheque!`

                

            },

            regraNegocioTroco(){

                if(this.juro > 0 && this.troco > 0){
                    if(this.troco == this.juro){
                        this.setDataValue('juro', 0.00)
                    }

                    if(this.valorRecebido < 0)
                        throw `Valor recebido é menor que Zero!`
                    
                }


                if(this.valorTotal > this.valor && (this.juro <= 0 && this.troco <= 0))
                    throw `O Valor pago é maior que o valor total do recebimento!`
            }
        },
        hooks:{
            afterValidate: (historico, options) => {

                if(['pendente', 'aberta'].indexOf(historico.status) !== -1)
                    return true

                let valor = utils.NumberUtil.cdbl(historico.valor)
                let valorTotal = utils.NumberUtil.cdbl(historico.valorTotal)
                let juro = utils.NumberUtil.cdbl(historico.juro)
                let desconto = utils.NumberUtil.cdbl(historico.desconto)
                let troco = utils.NumberUtil.cdbl(historico.troco)
                let valorRecebido = utils.NumberUtil.cdbl(historico.valorRecebido)

                if(utils.NumberUtil.cdbl(historico.desconto) > 0){
                    historico.juro = 0

                    historico.valorTotal = valor - desconto
                }else if(utils.NumberUtil.cdbl(juro) > 0){
                    historico.desconto = 0

                    historico.valorTotal = utils.NumberUtil.sum(valor , juro)
                }
                    

                

                if(valor == valorRecebido && (juro == 0 && desconto == 0)){
                    historico.troco = 0
                    return true
                }

                if(valorRecebido == 0)
                    throw `É obrigatório informar o valor a receber!`

                if(valorRecebido < valorTotal)
                    throw `Valor Recebido é menor que valor total! Não será permitido continuar.`


                if (utils.NumberUtil.cdbl(historico.chequeId) > 0 && ['cheque', 'cheque_pre'].indexOf(historico.formaPagamento) == -1)
                    historico.chequeId = null

                
                /*
                if(troco > 0 && ((valorRecebido - troco) != valorTotal))
                    throw `Valor de troco está incorreto!`
                
                if(troco == 0 && valorRecebido != valorTotal)
                    throw `Valor de troco está incorreto!`
                    */    

            }
        }


    })


    HistoricoDespesa.associate = models => {

        HistoricoDespesa.belongsTo(models.Despesa, {
            foreignKey: {
                name: 'despesaId',
                allowNull: false,
                field: 'contas_pagar_id',
                validate: {
                    validateInterno(value) {
                        this.despesaId = utils.MysqlUtil.validationInteger(value, 'Despesa obrigatória')
                    }
                }
            }, targetKey: 'id', as: 'despesa'
        })

        HistoricoDespesa.belongsTo(models.Usuario, {
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

        HistoricoDespesa.belongsTo(models.Cheque, {
            foreignKey: {
                name: 'chequeId',
                allowNull: true,
                field: 'cheque_id',
                set(value) {
                    this.setDataValue('chequeId', utils.NumberUtil.cdbl(value) > 0 ? value : null)
                },
                validate: {
                    validateInterno(value) {
                        if (value)
                            this.chequeId = utils.MysqlUtil.validationInteger(value, 'Cheque obrigatório')
                    }
                }
            }, targetKey: 'id', as: 'cheque'
        })
    }

    

    
    HistoricoDespesa.prototype.toJSON = function () {

        return Object.assign({}, this.get())
    }

    return HistoricoDespesa




}