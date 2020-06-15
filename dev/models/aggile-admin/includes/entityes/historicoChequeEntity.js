const enumns = require('../enuns/enum')
const _ = require('lodash')
const utils = require('../../../../helpers/_utils/utils')


const status = enumns.EnumStatusCheque.map((item) => { return item.value })

const tipoPessoasRepasse = _.filter(enumns.EnumTipoPessoa.map((item) => { return item.value !== 'agencia' ? item.value : '' }))

module.exports = (sequelize, DataType) => {


    const HistoricoCheque = sequelize.define('HistoricoCheque', {
        id: { type: DataType.INTEGER, primaryKey: true, autoIncrement: true },


        status: {
            type: DataType.ENUM,
            field: 'status',
            allowNull: false,
            values: status,
            validate: {
                regraNegocio(value) {
                    if (status.indexOf(value) === -1)
                        throw 'Status inválido!'
                }
            }
        },

        observacao: DataType.TEXT,

        tipoPessoaRepasse: {
            type: DataType.VIRTUAL,
            values: tipoPessoasRepasse,
            set(value) {
                if (tipoPessoasRepasse.indexOf(value) !== -1)
                    this.setDataValue('tipoPessoaRepasse', value)
                else
                    this.setDataValue('tipoPessoaRepasse', null)
            }

        }

    }, {
        timestamps: true,
        paranoid: true,
        underscored: true,
        freezeTableName: true,
        version: true,
        tableName: 'historicos_cheques',
        validate: {
        },
        hooks: {
            afterValidate: (historico, options) => {

                if (historico.pessoaRepasseId > 0) {
                    if (historico.tipoPessoaRepasse == '')
                        throw 'Tipo Pessoa repasse inválida!'
                }
            }
        }


    })


    HistoricoCheque.associate = models => {

        HistoricoCheque.belongsTo(models.Pessoa, {
            foreignKey: {
                name: 'pessoaRepasseId',
                allowNull: true,
                field: 'pessoa_repasse_id',
                validate: {
                    validateInterno(value) {
                        if (value)
                            this.pessoaRepasseId = utils.MysqlUtil.validationInteger(value, 'Pessoa obrigatória')
                    }
                }
            }, targetKey: 'id', as: 'pessoaRepasse'
        })


        HistoricoCheque.belongsTo(models.Cheque, {
            foreignKey: {
                name: 'chequeId',
                allowNull: false,
                field: 'cheque_id',
                validate: {
                    validateInterno(value) {
                        this.chequeId = utils.MysqlUtil.validationInteger(value, 'Cheque obrigatório')
                    }
                }
            }, targetKey: 'id', as: 'cheque'
        })

        HistoricoCheque.belongsTo(models.Usuario, {
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

        HistoricoCheque.belongsTo(models.ContaBancaria, {
            foreignKey: {
                name: 'contaBancariaId',
                allowNull: true,
                field: 'conta_bancaria_id',
                validate: {
                    validateInterno(value) {
                        if (value)
                            this.contaBancariaId = utils.MysqlUtil.validationInteger(value, 'Conta bancária obrigatória')
                    }
                }
            }, targetKey: 'id', as: 'contaBancaria'
        })


        HistoricoCheque.belongsTo(models.MotivoDevolucaoCheque, {
            foreignKey: {
                name: 'motivoDevolucaoId',
                allowNull: true,
                field: 'motivo_devolucao_id',
                validate: {
                    validateInterno(value) {
                        if (value)
                            this.motivoDevolucaoId = utils.MysqlUtil.validationInteger(value, 'Motivo de devolução obrigatório')
                    }
                }
            }, targetKey: 'id', as: 'motivoDevolucao'
        })
    }

    
    HistoricoCheque.prototype.validateToUltimoHistorico = function (ultimoHistorico = {}, cheque = {}) {
        let historico = this.get()


        if (ultimoHistorico.status == 'cancelado')
            throw 'Cheque já cancelado! Não será permitido fazer novos lançamentos com o mesmo cheque.'

        if (ultimoHistorico.status == 'depositado')
            throw 'Cheque já depositado! Não será permitido fazer novos lançamentos com o mesmo cheque.'


        if (historico.status == 'cancelado' && ['pendente', 'devolvido'].indexOf(ultimoHistorico.status) === -1)
            throw `O cheque só poderá ser cancelado se o status atual estiver como Pendente ou Devolvido!`

        if (ultimoHistorico.status == 'aguardando_depositado' && ['pendente', 'repassado', 'cancelado'].indexOf(historico.status) !== -1)
            throw `O Cheque não poderá ser ${historico.status} pois está aguardando depósito via banco!`


        if (ultimoHistorico.status == historico.status)
            throw `A última operação feita é igual a atual. Status Cheque: ${historico.status}`

        if (ultimoHistorico.status == 'repassado' && ['depositado', 'aguardando_depositado', 'pendente'].indexOf(historico.status) !== -1)
            throw `O cheque já foi repassado, não será permitido depositar ou alterar para pendente!`

        if (ultimoHistorico.status == 'repassado' && cheque.dataPredatado) {
            let dataInicial = utils.DateUtil.getMoment(cheque.dataPreDatado)
            let dataAtual = utils.DateUtil.getMoment(new Date())

            let diff = Math.abs(parseInt(utils.DateUtil.getInstanceMoment().duration(dataInicial.diff(dataAtual)).asDays()))

            if (isNaN(diff))
                diff = 90

            if (diff > 90)
                return res.json({ message: 'O pedido não pode ser mais consultado!' })

        }

        if (historico.status == 'depositado')
            historico.contaBancariaId = ultimoHistorico.contaBancariaId

        if (['aguardando_depositado', 'depositado'].indexOf(historico.status) !== -1 && !historico.contaBancariaId)
            throw 'Conta bancária não informada para a operação!'
    }




    HistoricoCheque.prototype.toJSON = function () {
        return Object.assign({}, this.get())
    }




    return HistoricoCheque

}
