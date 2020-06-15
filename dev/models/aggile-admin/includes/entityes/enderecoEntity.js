const utils = require('../../../../helpers/_utils/utils')
const _ = require('lodash')
const enumns = require('../enuns/enum')

module.exports = (sequelize, DataType) => {

    const Endereco = sequelize.define('Endereco', {
        id: { type: DataType.INTEGER, primaryKey: true, autoIncrement: true },
        bairro: {
            type: DataType.STRING,
            allowNull: false,

            validate: {
                notEmpty: { args: true, msg: 'Bairro obrigatório!' },
                len: { args: [3, 255], msg: 'Bairro deve ter no mínimo 3 caracteres e no máximo 255!' }
            }

        },
        logradouro: {
            type: DataType.STRING,
            allowNull: false,
            validate: {
                notEmpty: { args: true, msg: 'Endereço obrigatório!' },
                len: { args: [3, 255], msg: 'Endereço deve ter no mínimo 3 caracteres e no máximo 255!' }
            }
        },
        complemento: DataType.TEXT,
        cep: DataType.STRING(9),
        latitudeLongitude: {
            type: DataType.STRING(255),
            field: 'latitude_longitude',
            allowNull: true
        },
        observacao: DataType.TEXT,

        pessoaId: {
            type: DataType.INTEGER,
            field: 'pessoa_id',
            allowNull: false
        },
        tipoPessoa: {
            type: DataType.ENUM,
            values: enumns.EnumTipoPessoa.map((item) => { return item.value }),
            field: 'tipo_pessoa',
            allowNull: false
        },
        isPrincipal: {
            type: DataType.BOOLEAN,
            field: 'is_principal',
            allowNull: false,
            defaultValue: false

        }
    }, {
            timestamps: true,
            paranoid: true,
            underscored: true,
            freezeTableName: true,
            version: true,
            tableName: 'enderecos'
        })

    Endereco.associate = models => {
        Endereco.belongsTo(models.Municipio, {
            foreignKey: {
                name: 'municipioId',
                allowNull: false,
                field: 'municipio_id',
                validate: {
                    validateInterno(value) {
                        this.municipioId = utils.MysqlUtil.validationInteger(value, 'Municipio obrigatório')
                    }
                }
            }, targetKey: 'id', as: 'municipio'
        })
    }


    Endereco.prototype.toJSON = function () {
        return Object.assign({}, this.get())
    }

    return Endereco


}