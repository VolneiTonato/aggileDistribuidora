const utils = require('../../../../helpers/_utils/utils')
const _ = require('lodash')

module.exports = (sequelize, DataType) => {

    const Agencia = sequelize.define('Agencia', {
        id: { type: DataType.INTEGER, primaryKey: true, autoIncrement: true },
        nome: {
            type: DataType.STRING,
            field: 'nome',
            allowNull: true,
            validate: {
                notEmpty: { args: true, msg: 'Nome obrigatório!' },
                len: { args: [3, 255], msg: 'Nome deve ter no mínimo 3 caracteres e no máximo 255!' }
            }
        },
        numero: {type: DataType.INTEGER, field: 'numero', allowNull: false, validate: {
            notEmpty: { args: true, msg: 'Número da agência obrigatório!'}
        }},
        dv: {type: DataType.INTEGER, field: 'dv', allowNull: false, defaultValue: 0},
        tipoPessoa: { type: DataType.ENUM, field: 'tipo_pessoa', values: ['J', 'F'], defaultValue: 'J', allowNull: false },
        status: { type: DataType.BOOLEAN, field: 'status', defaultValue: true, allowNull: false },
        cnpjCpf: {
            type: DataType.STRING(18),
            field: 'cnpj_cpf',
            allowNull: true,
        },
        contato: {
            type: DataType.STRING,
            allowNull: true
        },

        observacao: DataType.TEXT,
        endereco: {
            type: DataType.VIRTUAL,
            get() {
                if (_.isArray(this.enderecos))
                    return (this.enderecos.map(item => { return item.isPrincipal == true ? item : {} }))[0]

                return {}

            }
        }
    }, {
        timestamps: true,
        paranoid: true,
        underscored: true,
        freezeTableName: false,
        tableName: 'agencias',
        version: true
    })


    Agencia.associate = models => {
        Agencia.hasOne(models.Pessoa, {as: 'pessoa', constraints: false, foreignKey: 'agenciaId'})

        Agencia.belongsTo(models.Banco, {
            foreignKey: {
                name: 'bancoId',
                allowNull: false,
                field: 'banco_id',
                validate: {
                    validateInterno(value) {
                        this.bancoId = utils.MysqlUtil.validationInteger(value, 'Banco obrigatório')
                    }
                }
            }, targetKey: 'id', as: 'banco'
        })
    }


    Agencia.prototype.toJSON = function () {
        let data = Object.assign({}, this.get())

        if(data.enderecos && data.telefones)
            return data

        
        let { pessoa } = data


        if(utils.ObjectUtil.isObject(pessoa)){
            data.enderecos = pessoa.enderecos
            data.telefones = pessoa.telefones
            if (_.isArray(data.enderecos))
                data.endereco = (data.enderecos.map(item => { return item.isPrincipal == true ? item : {} }))[0]

        }

        return data
    }

    





    return Agencia
}
