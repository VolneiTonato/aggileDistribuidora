const _ = require('lodash')
const utils = require('../../../../helpers/_utils/utils')

module.exports = (sequelize, DataType) => {

    const Fabrica = sequelize.define('Fabrica', {
        id: { type: DataType.INTEGER, primaryKey: true, autoIncrement: true },
        razaoSocial: {
            type: DataType.STRING,
            field: 'razao_social',
            validate: {
                notEmpty: { args: true, msg: 'Razão Social obrigatório!' },
                len: { args: [3, 255], msg: 'Razão Social deve ter no mínimo 3 caracteres e no máximo 255!' }
            }
        },
        nomeFantasia: {
            type: DataType.STRING,
            field: 'nome_fantasia',
            validate: {
                notEmpty: { args: true, msg: 'Nome Fantasia obrigatório!' },
                len: { args: [3, 255], msg: 'Nome Fantasia deve ter no mínimo 3 caracteres e no máximo 255!' }
            }
        },
        cnpj: {
            type: DataType.STRING,
            validate: {
                notEmpty: { args: true, msg: 'CNPJ obrigatório!' },
                len: { args: [18, 18], msg: 'CNPJ deve ter o total de 18 caracteres!' }
            }

        },
        markup: DataType.DECIMAL(10, 2),
        comissao: DataType.DECIMAL(10, 2),
        comissaoVendedor: { type: DataType.DECIMAL(10, 2), field: 'comissao_vendedor' },
        observacao: DataType.TEXT
    }, {
            timestamps: true,
            paranoid: true,
            underscored: true,
            freezeTableName: true,
            version: true,
            tableName: 'fabricas',
            validate: {
            }


        })

    Fabrica.associate = models => {
        Fabrica.hasOne(models.Pessoa, {as: 'pessoa', constraints: false, foreignKey: 'fabricaId', sourceKey: 'id'})
    }


    Fabrica.prototype.toJSON = function () {
        
        let data =  Object.assign({}, this.get())

        

        let { pessoa } = data

        if(pessoa)
            data.pessoaId = data.id

        return data
    }

    return Fabrica
}

