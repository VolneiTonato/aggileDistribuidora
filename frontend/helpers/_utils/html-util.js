const underscoreUtil = require('./underscore-utils')()


class HtmlUtil {

    constructor() {

    }




    static loader(templateId, param, parentId, options = {}) {
        templateId = templateId || '#template-loader'
        parentId = parentId || '#inner-content'

    
        this.loaderClose(parentId)

        param = param || { width: '20%', height: '20%' }

        param.key = parentId

        param = { loader: param }


        _.assign(options, { templateNotIsDesktopMobile: true, noWait: true })


        underscoreUtil._template('#template-loader', param, parentId, options)
    }

    static loaderClose(parentId, options = {}) {

        
        let element = $('body').find('.loader-app').filter(`[key="${parentId}"]`)

        if(typeof element !== "undefined")
            $(element).remove()
    }

    static loaderLazy(elementId, param) {
        $(elementId).lazy(param)
    }
}

module.exports = () => {
    return HtmlUtil
}