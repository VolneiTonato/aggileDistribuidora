const objectUtil = require('./object-util')()
const jquertUtil = require('./jquery-util')()
const maskedUtil = require('./mask-input-util')()

class UnderscoreUtil {

    

    static async _template(elementId, param, parentId, options = {}) {
        
        let htmlUtil = require('./html-util')()
        
        let render = async (templateId, blockId) => {
            

            let template = _.template($('body').find(templateId).html())

            

            let html = template(param)

            if (blockId != undefined) {

                if (/(admin|reports)/ig.test(location.href)) {
                    if (options.append == true)
                        $('body').find(blockId).append(html)
                    else
                        $('body').find(blockId).html(html)
                } else {

                    if (options.noWait == true)
                        $(blockId).html(html)
                    else
                        await $(blockId).css({ 'opacity': '0.4' }).delay(500).html(html).animate({ opacity: 1 })
                }

                jquertUtil.initializeComponentesJquery()

                maskedUtil.init()

                if(options.closeLoader == true)
                    htmlUtil.loaderClose(parentId)

            } else {
                return await html
            }
        }


        if (options.isDesktopMobile) {

            let ids = []

            if(options.templateNotIsDesktopMobile == true){

                ids.push(
                    { elementId : `${elementId}`, parentId : `${parentId}-desktop`},
                    { elementId : `${elementId}`, parentId : `${parentId}-mobile`}
                )
            }else{

                ids.push(
                    { elementId : `${elementId}-desktop`, parentId : `${parentId}-desktop`},
                    { elementId : `${elementId}-mobile`, parentId : `${parentId}-mobile`}
                )
            }

            ids.forEach( async (item) => { await render(item.elementId, item.parentId) }  )
        } else {

            return await render(elementId, parentId)

        }



        





    }


    static valueTemplate(obj, key) {

        try {




            if (!objectUtil.isObject(obj))
                return ''

            if (objectUtil.hasProperty(obj, key))
                return obj[key]



            return key.split(".").reduce((o, x) => {
                try {


                    if (typeof o == 'undefined' || o == null) {
                        return o.toString()
                    } else if (typeof o[x] == 'undefined' || o[x] == null) {
                        return ''
                    } else {
                        return o[x]
                    }
                } catch (err) {
                    return ''
                }
            }, obj)

        } catch (err) {
            return ''
        }
    }

}

module.exports = () => {
    return UnderscoreUtil
}