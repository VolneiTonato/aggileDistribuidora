const _ = require('lodash')
const enumns = require('../enuns/enum')
const utils = require('../../../../helpers/_utils/utils')



module.exports = (sequelize, DataType) => {

    const Cedente = sequelize.define('Cedente', {
        id: { type: DataType.INTEGER, primaryKey: true, autoIncrement: true },
        razaoSocial: {
            type: DataType.STRING,
            field: 'razao_social',
            allowNull: true,
            validate: {
                notEmpty: { args: true, msg: 'Razão Social obrigatório!' },
                len: { args: [3, 255], msg: 'Razão Social deve ter no mínimo 3 caracteres e no máximo 255!' }
            }
        },
        nomeFantasia: {
            type: DataType.STRING,
            field: 'nome_fantasia',
            allowNull: true,
            validate: {

                validateInterno(value) {

                    if (this.tipoPessoa === 'J') {

                        value = _.trim(value)

                        if (value === '')
                            throw new Error('Nome Fantasia obrigatório!')
                        if (value.length < 3)
                            throw new Error('Nome Fantasia deve ter no mínimo 3 caracteres')
                    }


                }
            }
        },
        tipoPessoa: { type: DataType.ENUM, field: 'tipo_pessoa', values: ['J', 'F'], defaultValue: 'J', allowNull: false },
        status: { type: DataType.BOOLEAN, field: 'status', defaultValue: true, allowNull: false },
        cnpjCpf: {
            type: DataType.STRING(18),
            field: 'cnpj_cpf',
            allowNull: true,
        },
        contato: {
            type: DataType.STRING,
            allowNull: false,
            validate: {
                notEmpty: { args: true, msg: 'Contato obrigatório!' },
            }
        },


        observacao: DataType.TEXT
    }, {
            timestamps: true,
            paranoid: true,
            underscored: true,
            freezeTableName: false,
            tableName: 'cedentes',
            version: true
        })


    Cedente.associate = models => {
        Cedente.hasOne(models.Pessoa, {as: 'pessoa', constraints: false, foreignKey: 'cedenteId'})

    }


    Cedente.prototype.toJSON = function () {
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


    


    return Cedente
}
