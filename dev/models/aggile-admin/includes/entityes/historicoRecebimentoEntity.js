const enums = require('../enuns/enum')
const utils = require('../../../../helpers/_utils/utils')

module.exports = (sequelize, DataType) => {

    const HistoricoRecebimento = sequelize.define('HistoricoRecebimento', {
        id: { type: DataType.INTEGER, primaryKey: true, autoIncrement: true },
        valor: {
            type: DataType.DOUBLE,
            field: 'valor',
            set(value) {
                this.setDataValue('valor', utils.MysqlUtil.setDecimalValue(value))
            }
        },
        valorLiquido: {
            type: DataType.VIRTUAL,
            get() {
                let valorTotal = this.getDataValue('valorTotal')
                let desconto = this.getDataValue('desconto')
                let juro = this.getDataValue('juro')
                let troco = this.getDataValue('troco')

                let juroAndTroco = juro >= troco ? utils.NumberUtil.diminuir(juro, troco) : utils.NumberUtil.diminuir(troco, juro)


                let total = utils.NumberUtil.sum(desconto, utils.NumberUtil.diminuir(valorTotal, Math.abs(juroAndTroco)))


                this.setDataValue('valorLiquido', total)

                return this.getDataValue('valorLiquido')
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
        troco: {
            type: DataType.DOUBLE,
            field: 'troco',
            set(value) {
                this.setDataValue('troco', utils.MysqlUtil.setDecimalValue(value))
            },
            valueDefault: 0.00
        },
        juro: {
            type: DataType.DOUBLE,
            field: 'juro',
            set(value) {
                this.setDataValue('juro', utils.MysqlUtil.setDecimalValue(value))
            }
        },
        desconto: {
            type: DataType.DOUBLE,
            field: 'desconto',
            set(value) {
                this.setDataValue('desconto', utils.MysqlUtil.setDecimalValue(value))
            }
        },
        valorTotal: {
            type: DataType.DOUBLE,
            field: 'valor_total',
            set(value) {
                this.setDataValue('valorTotal', utils.MysqlUtil.setDecimalValue(value))
            }
        },
        vencimento: {
            type: DataType.DATEONLY,
            field: 'vencimento',
            set(value) {

                if (value)
                    this.setDataValue('vencimento', utils.DateUtil.formatPtbrToUniversal(value))
                else
                    this.setDataValue('vencimento', new Date())
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
            field: 'data_pagamento',
            type: DataType.DATEONLY,
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

        dataBomPara: {
            type: DataType.DATEONLY,
            field: 'data_bom_para',
            set(value) {

                if(['cheque', 'dinheiro','boleto_a_vista','cartao_debito'].indexOf(this.getDataValue('formaPagamento')) !== -1)
                    value = null

                

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
            field: 'status_recebimento',
            values: enums.EnumStatusRecebimento.map((item) => { return item.value }),
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
            tableName: 'historico_contas_a_receber',
            validate: {
                regraNegocioCheque() {
          
                    if (['cheque', 'cheque_pre'].indexOf(this.formaPagamento) !== -1 && (!utils.NumberUtil.cdbl(this.chequeId) > 0 && this.status != 'estornada'))
                        throw `Para lançar a receita com Cheque ou Cheque Pré, será necessário informar um cheque!`
                    
    
                },
    
                regraNegocioTroco(){
    
                    if(this.juro > 0 && this.troco > 0){
                        if(this.troco == this.juro){
                            this.setDataValue('juro', 0.00)
                        }
    
                        if(this.valorRecebido < 0)
                            throw `Valor recebido é menor que Zero!`
                        
                    }

                    

                    if( utils.NumberUtil.cdbl(this.valorTotal) >  utils.NumberUtil.cdbl(this.valor) && (this.juro <= 0 && this.troco <= 0))
                        throw `O Valor pago é maior que o valor total do recebimento!`
                }
            },
            hooks:{
                afterValidate: (historico, options) => {

                    if(historico.status == 'aberta')
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


                    
                    
                    /*
                    if(troco > 0 && ((valorRecebido - troco) != valorTotal))
                        throw `Valor de troco está incorreto!`
                    
                    if(troco == 0 && valorRecebido != valorTotal)
                        throw `Valor de troco está incorreto!`
                        */    
    
                }
            }
    


        })

    HistoricoRecebimento.associate = models => {

        HistoricoRecebimento.belongsTo(models.Recebimento, {
            foreignKey: {
                name: 'recebimentoId',
                allowNull: false,
                field: 'contas_receber_id',
                validate: {
                    validateInterno(value) {
                        this.recebimentoId = utils.MysqlUtil.validationInteger(value, 'Recebimento obrigatório')
                    }
                }
            }, targetKey: 'id', as: 'recebimento'
        })

        HistoricoRecebimento.belongsTo(models.Usuario, {
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


        HistoricoRecebimento.belongsTo(models.Cheque, {
            foreignKey: {
                name: 'chequeId',
                allowNull: true,
                field: 'cheque_id',
                validate: {
                    validateInterno(value) {
                        if(value)
                            this.chequeId = utils.MysqlUtil.validationInteger(value, 'Cheque obrigatório')
                        else
                            this.chequeId = null
                    }
                }
            }, targetKey: 'id', as: 'cheque'
        })
    }

    return HistoricoRecebimento
}