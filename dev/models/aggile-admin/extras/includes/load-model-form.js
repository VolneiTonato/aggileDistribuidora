const _ = require('lodash')
const ObjectUtil = require('../../../../helpers/_utils/repo/object-util')


class LoadModelToForm {


    static extractAttributes(attributos = []) {
        let retorno = []
        attributos.forEach(properties => {
            for (let propertie in properties) {
                retorno.push(propertie)
            }
        })

        return retorno
    }



    static loadChangeModel(model = {}, post = {}) {



        let attributos = LoadModelToForm.extractAttributes([model.rawAttributes])

        if (model._options && (model._options.includeNames))
            attributos = _.concat(attributos, model._options.includeNames)


        let notAttributesChange = ['version', 'updated_at', 'created_at', 'deleted_at', 'updatedAt', 'createdAt', 'deletedAt']





        attributos.forEach((property) => {
            try {

                if (notAttributesChange.indexOf(property) === -1) {



                    if (property == 'usuarioId' && post['usuarioLogado']) {
                        model[`${property}`] = post['usuarioLogado'].id

                    } else {



                        if (_.isObject(model[property])) {



                            if (model[`${property}Id`] && typeof post[property] == 'object')
                                model[`${property}Id`] = post[property].id


                            if (post[property])
                                model[`${property}`] = this.loadChangeModel(model[property], post[property])
                            else if (model[property])
                                model[`${property}`] = this.loadChangeModel(model[property], model[property])

                        } else {

                            if (ObjectUtil.getValueProperty(post, property))
                                model[property] = post[property]
                            else
                                model[property] = model[property]


                        }
                    }
                }
            } catch (err) {
                model[property] = model[property]
            }
        })

        return model
    }



    static load(model = {}, post = {}) {

        try {

            let attributes = LoadModelToForm.extractAttributes([model.rawAttributes])

            attributes.forEach(item => {
                try {

                    if (item == 'usuarioId' && post['usuarioLogado'])
                        model[`${item}`] = post['usuarioLogado'].id

                    else if (ObjectUtil.getValueProperty(post, item))
                        model[item] = post[item]

                } catch (err) {

                }
            })

        } catch (err) {

        }

        return model
    }

    static setData(modelExistente, modelPost = {}, fields = []) {

        try {

            let data = LoadModelToForm.extractAttributes([modelExistente.rawAttributes])

            if (modelExistente._options && (modelExistente._options.includeNames))
                data = _.concat(data, modelExistente._options.includeNames)

            //let data = Object.getOwnPropertyNames(modelPost.dataValues)

            

            data.forEach((key) => {
                fields.forEach((column) => {

                    if (column == key && ObjectUtil.hasProperty(modelExistente.dataValues, key)) {
                        let v = modelPost[key]
                        modelExistente[key] = v == undefined ? null : v
                    }
                })
            })



        } catch (err) {

        } finally {

            return modelExistente
        }


    }
}

module.exports = LoadModelToForm