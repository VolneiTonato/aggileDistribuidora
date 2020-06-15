const _ = require('lodash')
const enumns = require('../enuns/enum')
const utils = require('../../../../helpers/_utils/utils')



module.exports = (sequelize, DataType) => {

    const Cliente = sequelize.define('Cliente', {
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
        tipoPessoaText: {
            type: DataType.VIRTUAL,
            get(){
                return (this.tipoPessoa == 'J' ? 'Pessoa Jurídica': 'Pessoa Física')
            }
        },
        tipoEstabelecimento: {
            type: DataType.ENUM, field: 'tipo_estabelecimento',
            values: enumns.EnumTipoEstabelecimentoCliente.map((item) => { return item.value }),
            allowNull: false,
            validate: {
                notEmpty: { args: true, msg: 'Tipo obrigatório!' },
            }
        },
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
            tableName: 'clientes',
            version: true
        })


    Cliente.associate = models => {
        Cliente.hasOne(models.Pessoa, {as: 'pessoa', constraints: false, foreignKey: 'clienteId', sourceKey: 'id'})
    }

    
    Cliente.prototype.toJSON = function () {

        let data =  Object.assign({}, this.get())

        let { pessoa } = data

        if(pessoa)
            data.pessoaId = data.id

        return data
    }

    


    return Cliente
}
