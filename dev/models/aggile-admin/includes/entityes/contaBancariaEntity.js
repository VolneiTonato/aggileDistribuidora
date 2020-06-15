const utils = require('../../../../helpers/_utils/utils')
const _ = require('lodash')

const enumns = require('../enuns/enum')

let tipoCadastro = _.concat(enumns.EnumTipoPessoa, [{ text: 'Sem Associação', value: 'sem-associacao', id: 6 }]).map(item => { return item.value })

module.exports = (sequelize, DataType) => {

    const ContaBancaria = sequelize.define('ContaBancaria', {

        id: { type: DataType.INTEGER, primaryKey: true, autoIncrement: true },

        titular: {
            type: DataType.STRING,
            field: 'titular',
            allowNull: false,
            validate: {
                notEmpty: { args: true, msg: 'Titular obrigatório!' },
                len: { args: [3, 255], msg: 'Titular deve ter no mínimo 3 caracteres e no máximo 255!' }
            }
        },

        numero: {
            type: DataType.INTEGER, field: 'numero', allowNull: false, validate: {
                notEmpty: { args: true, msg: 'Número da agência obrigatório!' },
                len: { args: [3, 10], msg: 'Número da conta deve ter no mínimo 3 caracteres e no máximo 10!' }
            }
        },

        dv: {
            type: DataType.INTEGER, field: 'dv', allowNull: false, defaultValue: 0, valdate: {
                notEmpty: { args: true, msg: 'DV da agência obrigatório!' },
                len: { args: [1, 10], msg: 'DV da conta deve ter no mínimo 1 caracteres e no máximo 5!' },
                value(value) {
                    if (!parseInt(value) < 0)
                        throw 'DV obrigatório!'
                },
            }
        },

        tipoPessoa: { type: DataType.ENUM, field: 'tipo_pessoa', values: ['J', 'F'], defaultValue: 'J', allowNull: false },

        status: { type: DataType.BOOLEAN, field: 'status', defaultValue: true, allowNull: false },

        cnpjCpf: {
            type: DataType.STRING(18),
            field: 'cnpj_cpf',
            allowNull: true,
            validate: {
                cnpjCpfToTipoCadastro(value) {
                    if (this.getDataValue('tipoCadastro') == 'sem-associacao')

                        if ([14, 11].indexOf(utils.NumberUtil.filter(value).length) == -1)
                            throw 'CNPJ/CPF obrigatório!'
                }
            }

        },

        observacao: DataType.TEXT,


        tipoCadastro: {
            type: DataType.ENUM,
            values: _.filter(tipoCadastro.map((item) => {
                if (['cliente', 'fabrica', 'vendedor','cedente', 'sem-associacao'].indexOf(item) > -1)
                    return item
            })),
            field: 'tipo_cadastro',
            defaultValue: 'sem-associacao',
            allowNull: false,

            set(value) {

                if (['cedente','vendedor', 'cliente', 'fabrica', 'sem-associacao'].indexOf(value) == -1)
                    this.setDataValue('tipoCadastro', 'sem-associacao')
                else
                    this.setDataValue('tipoCadastro', value)


                if (this.getDataValue('tipoCadastro') != 'sem-associacao')
                    this.setDataValue('telefones', [])
            }
        },
    }, {
        validate: {
            validateGeral() {

                if (this.getDataValue('tipoCadastro') == 'sem-associacao')
                    this.setDataValue('pessoaId', null)
            }
        },
        timestamps: true,
        paranoid: true,
        underscored: true,
        freezeTableName: false,
        tableName: 'contas_bancarias',
        version: true,

    })


    ContaBancaria.associate = models => {




        ContaBancaria.belongsTo(models.Pessoa, {
            foreignKey: {
                name: 'pessoaId',
                allowNull: true,
                field: 'pessoa_id',
                validate: {
                    validateInterno(value) {
                        if(this.tipoCadastro != 'sem-associacao')
                            this.pessoaId = utils.MysqlUtil.validationInteger(value, 'Pessoa obrigatória')
                    }
                }
            }, targetKey: 'id', as: 'pessoa'
        })



        ContaBancaria.hasMany(models.Telefone, { foreignKey: { allowNull: true, name: 'contaBancariaId' }, targetKey: 'id', as: 'telefones' })



        ContaBancaria.belongsTo(models.Pessoa, {
            foreignKey: {
                name: 'pessoaAgenciaId',
                allowNull: true,
                field: 'pessoa_agencia_id',
                validate: {
                    validateInterno(value) {
                        this.pessoaAgenciaId = utils.MysqlUtil.validationInteger(value, 'Agência obrigatória')
                    }
                }
            }, targetKey: 'id', as: 'pessoaAgencia'
        })


    }

    ContaBancaria.prototype.toJSON = function () {
        
        let data = Object.assign({}, this.get())

        if(data.tipoCadastro)
            data.titular = data.titular || _.get(data, 'pessoa.nome')


        if (data.pessoa) 

            if (utils.ArrayUtil.length(data.telefones) == 0)
                data.telefones = _.union(data.telefones, data.pessoa.telefones)

        return data
    }


    return ContaBancaria
}
