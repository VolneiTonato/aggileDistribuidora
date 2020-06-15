const htmlUtil = require('./html-util')()
const underscoreUtil = require('./underscore-utils')()

class BreadCrumb {

    constructor() {
        this._bread = []
        this._contais = []
    }

    add(label, url) {
        if (this._contais.indexOf(label) == -1) {
            this._contais.push(label)
            this._bread.push({ label: label, url: url })
        }
        return this
    }



    show(title, idElement) {

        idElement = idElement || '#inner-content-header'

        let countBread = this._bread.length - 1

        this._bread.forEach(function (obj, idx) {

            obj.class = ""
            obj.iconFirst = false

            if (countBread == idx) {
                obj.url = '#'
                obj.class = ' active '
            }
            if (idx == 0) obj.iconFirst = true

        })

        let  data = {
            itens : this._bread,
            title : 'AGGILE DISTRIBUIDORA' + (title == undefined ? '' : ` <smal>${title}</small>`)
        } 

        this._bread = []
        this._contais = []

        underscoreUtil._template('#template-content-header', {breadCrumb : data }, idElement)
    }
}

module.exports = () => {
    return BreadCrumb
}


