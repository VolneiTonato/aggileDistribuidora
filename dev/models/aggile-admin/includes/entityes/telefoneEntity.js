const enumns = require('../enuns/enum')
const _ = require('lodash')

let tipoPessoasTelefone = _.concat(enumns.EnumTipoPessoa, [{ text: 'Conta Bancária', value: 'conta-bancaria', id: 5 }]).map(item => { return item.value })

module.exports = (sequelize, DataType) => {


    const Telefone = sequelize.define('Telefone', {
        id: { type: DataType.INTEGER, primaryKey: true, autoIncrement: true },

        numero: {
            type: DataType.STRING,
            field: 'numero',
            allowNull: false,
            validate(value) {
                if (!value || ([11, 10].indexOf(value.length) === -1))
                    throw `Número inválido: ${value}`
            }
        },
        
        pessoaId: {
            type: DataType.INTEGER,
            field: 'pessoa_id',
            allowNull: false
        },
        tipoPessoa: {
            type: DataType.ENUM,
            values: tipoPessoasTelefone,
            field: 'tipo_pessoa',
            allowNull: false
        },

    }, {
        timestamps: true,
        paranoid: false,
        underscored: true,
        freezeTableName: true,
        version: true,
        tableName: 'telefones',
        validate: {
            
        }
    })


    Telefone.prototype.toJSON = function () {

        return Object.assign({}, this.get())
    }

    return Telefone
}

