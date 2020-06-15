const objectUtil = require('./object-util')()
const jsonUtil = require('./json-util')()


const isConvertProperty = (text) => {
    return /_/g.test(text)
}

const underlineToProperty = (text) => {
    let retorno = {}

    if (/_/g.test(text)) {
        let aux = text.split('_')

        let auxRetorno = false

        let total = aux.length - 1

        aux.forEach((element, i) => {

            if (auxRetorno == true) {

                retorno += `:{"${element}"`

                if (total == i) {
                    retorno += `:"__VALUE__"`

                    for (let j = 0; j <= total; j++)
                        retorno += '}'
                }

            } else {
                auxRetorno = true
                retorno = `{"${element}"`
            }

        })
        return JSON.parse(retorno)
    } else {
        return text
    }


}

const changeValueProperty = (obj, value) => {

    for (let property in obj) {
        if (obj.hasOwnProperty(property)) {
            if (typeof obj[property] == "object") {
                changeValueProperty(obj[property], value)
            }
            else {

                if (obj[property] == '__VALUE__') {
                    obj[property] = value

                }
            }
        }
    }

    return obj
}

const changeValuesFormObject = (objeto, item) => {
    for (let property in item) {

        let index = property

        if (/(\[\])/ig.test(property))
            index = property.replace(/(\[\])/ig, '')


        if (!objeto.hasOwnProperty(index)) {
            if (/(\[\])/ig.test(property)) {
                if (!_.isArray(objeto[index]))
                    objeto[index] = new Array()
                objeto[index].push(item[property])
            } else {
                objeto[index] = item[property]
            }

        } else {
            if (typeof item[property] == "object") {
                changeValuesFormObject(objeto[index], item[property])
            } else {
                if (/(\[\])/ig.test(property)) {

                    if (!_.isArray(objeto[index]))
                        objeto[index] = new Array()

                    objeto[index].push(item[property])

                } else {
                    objeto[index] = item[property]
                }
            }
        }
    }
    return objeto
}


class FormUtil {

    static init() {

    }


    static redirectBlank(url) {
        let a = document.createElement('a')
        a.target = "_blank"
        a.href = url
        a.click()
    }

    static mapObject(elementForm) {

        let data = {
            formObject: {},
            formElement: {}
        }

        let key

        let variables = []

        $('body').find(elementForm).find('input,textarea, select').each((i, input) => {




            let value = $(input).val()

            if ($(input).attr('type') == 'radio')
                value = $(`input[name="${$(input).attr('name')}"]:checked`, elementForm).val()


            if ($(input).prop('tagName') == 'TEXTAREA' && $(input).hasClass('editor-ckeditor'))
                try {
                    value = CKEDITOR.instances[$(input).attr('id')].getData()
                } catch (err) { }


            try {
                if (value.trim().search(/^(\[|\{){1}/) > -1) {
                    if (jsonUtil.isJsonString(value))
                        value = jsonUtil.toParse(value)
                }
            } catch (err) {

            }






            if (isConvertProperty($(input).attr('name'))) {


                key = underlineToProperty($(input).attr('name'))



                variables.push(key)

                let setObject = true

                if (['checkbox', 'radio'].indexOf($(input).attr('type')) !== -1)
                    setObject = $(input).is(':checked')




                if (setObject) {

                    //let element = changeValueProperty(jsonUtil.toReParse(key), $(input))
                    let object = changeValueProperty(jsonUtil.toReParse(key), value)


                    data.formObject = changeValuesFormObject(data.formObject, object)

                    //data.formElement = teste(data.formElement, element)

                    //$.extend(true, data.formObject, changeValueProperty(jsonUtil.toReParse(key), value))

                    $.extend(true, data.formElement, changeValueProperty(jsonUtil.toReParse(key), $(input)))
                }






            } else {

                key = $(input).attr('name')

                variables.push(key)

                data.formElement[key] = $(input)



                if (/(\[\])/ig.test(key)) {

                    if (!data.formObject[key])
                        data.formObject[key] = new Array()

                    if ($(input).attr('type') == 'checkbox' && ($(input).is(':checked')))
                        data.formObject[key] = value
                    //else if ($(input).attr('type') == 'radio' && ($(input).is(':checked')))
                    //    data.formObject[key].push(value)
                    //else if (['text', 'select'].indexOf($(input).attr('type')) !== 1)
                    //    data.formObject[key].push(value)
                    else
                        data.formObject[key].push(value)

                } else {
                    data.formObject[key] = value
                }
            }

        })

        return data


    }


    static createElementInput(form, name, value, type = 'text') {
        try {

            let inputPessoaNome = `input[name="${name}"]`


            if (form.find(inputPessoaNome).length == 0)
                form.append(`<input type="${type}" value="" name="${name}" />`)


            form.find(inputPessoaNome).val(value)

        } catch (err) {
            
        }

    }

}


module.exports = () => {
    FormUtil.init()
    return FormUtil
} 