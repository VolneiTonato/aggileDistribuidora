const _ = require('lodash')
const enumns = require('../enuns/enum')
const utils = require('../../../../helpers/_utils/utils')

const methodPrivate = {
    isLoadJSON : Symbol('isLoadJSON')
}

const toJSONOverride = (instance) => {
   

    if (instance[methodPrivate.isLoadJSON] == true)
        return instance

    instance[methodPrivate.isLoadJSON] = true

    if (_.isArray(instance.enderecos))
        instance.endereco = instance.enderecos.map(item => { return item.isPrincipal == true ? item : {} })[0]


    _.each(['cliente', 'vendedor', 'fabrica', 'cedente', 'agencia'], field => {

        if (instance.tipoPessoa == field && _.isObject(instance[field])) {

            switch (field) {
                case 'cliente':
                case 'fabrica':
                case 'cedente':
                    instance.nome = _.get(instance[field], 'razaoSocial')
                    instance.segundoNome = _.get(instance[field], 'nomeFantasia')
                    break
                case 'agencia':
                    instance.nome = _.get(instance[field], 'nome')
                    instance.segundoNome = _.get(instance[field], 'nome')
                    break
                case 'vendedor':
                    instance.nome = _.get(instance[field], 'nomeCompleto')
                    instance.segundoNome = _.get(instance[field], 'nomeCompleto')
                    break
            }


            instance[field].enderecos = instance.enderecos
            instance[field].telefones = instance.telefones

            if (instance.endereco)
                instance[field].endereco = instance.endereco

        }
    })
    return instance

}



module.exports = (sequelize, DataType) => {

    const Pessoa = sequelize.define('Pessoa', {
        id: { type: DataType.BIGINT, primaryKey: true, autoIncrement: true },
        tipoPessoa: {
            type: DataType.ENUM,
            values: enumns.EnumTipoPessoa.map((item) => { return item.value }),
            field: 'tipo_pessoa',
            allowNull: false,
            validate: {
                data(value) {
                    if (!_.filter(enumns.EnumTipoPessoa, { value: value }))
                        throw 'Tipo pessoa inválido'
                }
            }
        },
        endereco: {
            type: DataType.VIRTUAL,
            get() {
                toJSONOverride(this)
                return this.getDataValue('endereco')
            }
        },

        

        nome: {
            type: DataType.VIRTUAL,
            get() {

                toJSONOverride(this)
                return this.getDataValue('nome')
            }
        },
        segundoNome: {
            type: DataType.VIRTUAL,
            get() {
                toJSONOverride(this)
                return this.getDataValue('segundoNome')
            }
        }

    }, {
        timestamps: true,
        paranoid: true,
        underscored: true,
        freezeTableName: false,
        tableName: 'pessoas',
        version: true,
        hooks: {
            beforeCreate: (pessoa, options) => {
                if (!utils.NumberUtil.cInt(pessoa[`${pessoa.tipoPessoa}Id`]) > 0)
                    throw `Não foi informado o idParent para pessoa do tipo ${pessoa.tipoPessoa}`

            }
        }
    })

    Pessoa.prototype[methodPrivate.isLoadJSON] = false



    Pessoa.associate = models => {
        Pessoa.belongsTo(models.Fabrica, {
            foreignKey: {
                name: 'fabricaId',
                allowNull: true,
                field: 'fabrica_id',
                set(value) {
                    this.setDataValue('fabricaId', utils.NumberUtil.isInt(value) === true ? value : null)
                }
            }, targetKey: 'id', as: 'fabrica', onDelete: 'restrict'
        })
        Pessoa.belongsTo(models.Cliente, {
            foreignKey: {
                name: 'clienteId',
                allowNull: true,
                field: 'cliente_id',
                set(value) {
                    this.setDataValue('clienteId', utils.NumberUtil.isInt(value) === true ? value : null)
                }
            }, targetKey: 'id', as: 'cliente', onDelete: 'restrict'
        })

        Pessoa.belongsTo(models.Agencia, {
            foreignKey: {
                name: 'agenciaId',
                allowNull: true,
                field: 'agencia_id',
                set(value) {
                    this.setDataValue('agenciaId', utils.NumberUtil.isInt(value) === true ? value : null)
                }
            }, targetKey: 'id', as: 'agencia', onDelete: 'restrict'
        })

        Pessoa.belongsTo(models.Cedente, {
            foreignKey: {
                name: 'cedenteId',
                allowNull: true,
                field: 'cedente_id',
                set(value) {
                    this.setDataValue('cedenteId', utils.NumberUtil.isInt(value) === true ? value : null)
                }
            }, targetKey: 'id', as: 'cedente', onDelete: 'restrict'
        })

        Pessoa.belongsTo(models.Vendedor, {
            foreignKey: {
                name: 'vendedorId',
                allowNull: true,
                field: 'vendedor_id',
                set(value) {
                    this.setDataValue('vendedorId', utils.NumberUtil.isInt(value) === true ? value : null)
                }
            }, targetKey: 'id', as: 'vendedor', onDelete: 'restrict'
        })

        Pessoa.hasMany(models.Endereco, { as: 'enderecos', foreignKey: 'pessoaId' })
        Pessoa.hasMany(models.Telefone, { as: 'telefones', foreignKey: 'pessoaId' })
    }


    Pessoa.prototype.toJSON = function () {

        let data = Object.assign({}, this.get())

        data[methodPrivate.isLoadJSON] = false


        toJSONOverride(data)

    
        return data
    }






    return Pessoa
}
