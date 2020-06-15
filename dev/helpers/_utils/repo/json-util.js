const _ = require('lodash')
const circularJson = require('circular-json-es6')


const replacerJsonUtil = (key, value) => {

    

    if (/"/g.test(value))
        value = value.replace(/"/g, '\"')

    if ([undefined, null].indexOf(value) !== -1)
        value = ``
        
    if (/(&quot;)/g.test(value))
        value = value.replace(/(&quot;)/g, '\"')

    return value


}

class JsonUtil {

    static toReparseCircular(content){
        return circularJson.parse(circularJson.stringify(content))
    }


    static toString(content) {
     
        return JSON.stringify(content, replacerJsonUtil)
    }
    static toSerializeHtml(input) {
        return _.escape(JsonUtil.toString(input))
    }

    static toReParse(content) {
        try {
            return JsonUtil.toParse(JsonUtil.toString(content))
        } catch (err) {
            throw err
        }
    }

    static toParse(content) {
        try {
            return JSON.parse(content)
        } catch (err) {
            throw err.message
        }
    }

    static isJsonString(text) {
        try {
            JSON.parse(text)
            return true
        } catch (err) {
            return false
        }
    }
}

module.exports = JsonUtil