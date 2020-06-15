const utils = require('../../../../helpers/_utils/utils')
const _ = require('lodash')


module.exports = (sequelize, DataType) => {

    let Vendedor = sequelize.define('Vendedor', {
        id: { type: DataType.INTEGER, primaryKey: true, autoIncrement: true },
        nomeCompleto: {
            type: DataType.STRING,
            field: 'nome_completo',
            allowNull: false,
            validate: {
                notEmpty: { args: true, msg: 'Nome obrigatório!' },
                len: { args: [3, 255], msg: 'Nome deve ter no mínimo 3 caracteres e no máximo 255!' }
            }
        },
        tipoPessoa: { type: DataType.ENUM, field: 'tipo_pessoa', values: ['J', 'F'], defaultValue: 'J', allowNull: false },
        status: { type: DataType.ENUM, field: 'status', values: ['ativo', 'inativo', 'bloqueado'], defaultValue: 'ativo', allowNull: false },
        cnpjCpf: {
            type: DataType.STRING(18),
            field: 'cnpj_cpf',
            allowNull: true,
        },
        observacao: DataType.TEXT,
        uuid: DataType.UUID,
        comissao: {
            type: DataType.DECIMAL(10, 2),
            field: 'comissao',
            allowNull: false,
            defaultValue: 0.00
        }
    }, {
            timestamps: true,
            paranoid: true,
            underscored: true,
            freezeTableName: false,
            tableName: 'vendedores',
            version: true,
            name: {
                singular: 'vendedor',
                plural: 'venedores'
            }
        })

    Vendedor.associate = models => {




        Vendedor.belongsTo(models.Usuario, {
            foreignKey: {
                name: 'usuarioId',
                allowNull: false,
                onDelete: 'restrict',
                field: 'usuario_id',
                validate: {
                    validateInterno(value) {
                        this.usuarioId = utils.MysqlUtil.validationInteger(value, 'Usuário obrigatório')
                    }
                }
            }, targetKey: 'id', as: 'usuario', through: 'vendedor'
        })

        Vendedor.hasOne(models.Pessoa, {as: 'pessoa', constraints: false, foreignKey: 'vendedorId'})


    }



    Vendedor.prototype.toJSON = function () {

        let data = Object.assign({}, this.get())

        return data
    }

    return Vendedor



}