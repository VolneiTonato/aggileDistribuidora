module.exports = (sequelize, DataType) => {
    
    const FormaPagamento = sequelize.define('FormaPagamento', {
        id: { type: DataType.INTEGER, primaryKey: true, autoIncrement: true },
        descricao: {
            type: DataType.STRING,
            field: 'descricao',
            validate: {
                notEmpty: { args: true, msg: 'Descrição obrigatório!' },
                len: { args: [3, 255], msg: 'Descrição deve ter no mínimo 3 caracteres e no máximo 255!' }
            }
        }
    }, {
            timestamps: true,
            paranoid: true,
            underscored: true,
            freezeTableName: true,
            version: true,
            tableName: 'formas_de_pagamento',
            validate: {
            }


        })

    return FormaPagamento
}