const utils = require('../../../../helpers/_utils/utils')
const _ = require('lodash')
const bcrypt = require('bcrypt')

module.exports = (sequelize, DataType) => {
    /** USUARIO */


    const Usuario = sequelize.define('Usuario', {
        id: { type: DataType.INTEGER, primaryKey: true, autoIncrement: true },

        login: {
            type: DataType.STRING,
            unique: true,
            field: 'login',
            allowNull: false,
            set(value) {
                try {
                    this.setDataValue('login', _.toLower(value).replace(/[^a-z]/ig, '').substring(0, 15))
                } catch (err) {
                    this.setDataValue('login', '')
                }
            },
            validate: {
                notEmpty: { args: true, msg: 'Login obrigatório!' },
                len: { args: [4, 15], msg: 'Login deve ter no mínimo 3 caracteres e no máximo 255!' }
            }
        },

        permissao: {
            type: DataType.STRING,
            field: 'permissao',
            allowNull: false,
            set(value) {
                try {
                    if (_.isArray(value) && (value.length > 0))
                        this.setDataValue('permissao', utils.JsonUtil.toString(_.zipObject(_.keys(value), value)))
                    else
                        this.setDataValue('permissao', '')
                } catch (err) {
                    this.setDataValue('permissao', '')
                }

            },
            get() {
                try {
                    if (utils.JsonUtil.isJsonString(this.getDataValue('permissao')))
                        return _.values(utils.JsonUtil.toParse(this.getDataValue('permissao')))
                } catch (err) {
                    return ''
                }
            },
            validate: {
                notEmpty: { args: true, msg: 'Informe uma permissão!' },
                len: { args: [4, 255], msg: 'Permissão obrigatória!' }
            }
        },

        password: {
            type: DataType.STRING,
            field: 'password',
            allowNull: false,
            set(value) {
                this.setDataValue('password', bcrypt.hashSync(value, bcrypt.genSaltSync(8), null))
            },
            validate: {
                notEmpty: { args: true, msg: 'Password obrigatório!' },
                len: { args: [6, 255], msg: 'Password deve ter no mínimo 6!' }
            }
        },

        nome: {
            type: DataType.STRING,
            field: 'nome',
            unique: true,
            allowNull: false,
            validate: {
                notEmpty: { args: true, msg: 'Nome obrigatório!' },
                len: { args: [3, 255], msg: 'Nome deve ter no mínimo 3 caracteres e no máximo 255!' }
            }
        },
        email: {
            type: DataType.STRING,
            field: 'email',
            validate: {
                notEmpty: { args: true, msg: 'Email obrigatório!' }
            }
        },
        status: { type: DataType.ENUM, field: 'status', values: ['ativo', 'inativo'], defaultValue: 'ativo', allowNull: false },
        passwordTextplain: {
            type: DataType.VIRTUAL,
            set(val) {
                this.setDataValue('passwordTextplain', val)
            },
            get() {
                return this.getDataValue('passwordTextplain')
            }

        },
        isVendedor: {
            type: DataType.VIRTUAL
        }


    }, {
            timestamps: true,
            paranoid: true,
            underscored: true,
            freezeTableName: true,
            version: true,
            tableName: 'usuarios',
            validate: {
            }


        })


    // methods ======================
    // generating a hash
    Usuario.prototype.generateHash = function (password) {
        return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
    }

    // checking if password is valid
    Usuario.prototype.validPassword = function (password) {
        return bcrypt.compareSync(password, this.password)
    }

    Usuario.prototype.toJSON = function () {
        let data = Object.assign({}, this.get())

        return data
    }

    
    return Usuario

}