const sequelize = require('./entityes/index')
const utils = require('../../../helpers/_utils/utils')
const _ = require('lodash')




class TelefoneModel {

    constructor() {
        this._model = sequelize.entity.Telefone
    }




    async findOne(conditions) {

        let where = {
            where: conditions
        }

        return await this._model.findOne(where)
    }


    async saveTelefones(idParent, telefones = Array, type = 'cliente', options) {


        telefones = _.chain(telefones)
            .map(utils.NumberUtil.telefoneFormat)
            .filter()
            .uniqWith()
            .value()

        if (utils.ArrayUtil.length(telefones) == 0)
            return true


        let where = {}

        where.tipoPessoa = type
        where.pessoaId = idParent



        let telefonesExistentes = await this._model.findAll({ where: where })

        let lengthFones = {
            existente: utils.ArrayUtil.length(telefonesExistentes),
            atual: utils.ArrayUtil.length(telefones)
        }


        if (lengthFones.existente > 0) {

            if (lengthFones.atual == lengthFones.existente) {

                await Promise.all(telefonesExistentes.map(async (fone, i) => {
                    fone.numero = telefones[i]
                    await fone.save(options).catch((err) => { throw err })
                }))

            } else if (lengthFones.atual > lengthFones.existente) {

                await Promise.all(telefones.map(async (numero, i) => {
                    let fone = {}

                    if (telefonesExistentes[i]) {

                        fone = telefonesExistentes[i]
                        fone.numero = numero
                        await fone.save(options).catch((err) => { throw err })

                    } else {

                        fone = _.assign(where, { numero: numero })

                        await this._model.create(fone, options).catch((err) => { throw err })
                    }

                }))
            } else if (lengthFones.atual < lengthFones.existente) {
                await Promise.all(telefonesExistentes.map(async (fone, i) => {
                    if (telefones[i]) {
                        fone.numero = telefones[i]
                        await fone.save(options).catch((err) => { throw err })
                    } else {
                        await this._model.destroy({
                            where: { id: fone.id }
                        }).catch((err) => { throw err })
                    }
                }))
            }

        } else {


            await Promise.all(telefones.map(async numero => {
                let fone = _.assign(where, { numero: numero })

                await this._model.create(fone, options).catch((err) => { throw err })

            }))

        }

        return true
    }

}


module.exports = TelefoneModel