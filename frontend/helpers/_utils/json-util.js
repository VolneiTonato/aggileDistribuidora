const replacerJsonUtil = (key, value) => {

    if (/"/g.test(value))
        value = value.replace(/"/g, '\"')


    if (/(&quot;)/g.test(value))
        value = value.replace(/(&quot;)/g, '\"')

    return value
}




class JsonUtil {

    static toValuesIndexDb(obj){

        return JSON.parse(JSON.stringify(obj, (key, value) => {
            if(value === null || value === true || value === false || value === undefined)
                return `${value}`
            else if(!isNaN(value))
                return parseFloat(value)
            else if(typeof value == 'object')
                return value
            else
                return `${value}`
        
        }))
    }


    static toString(content) {
        return JSON.stringify(content, replacerJsonUtil)
    }

    static toSerializeHtml(input) {
        return _.escape(this.toString(input))
    }

    static toReParse(content){
        try{
            return this.toParse(this.toString(content))
        }catch(err){
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

    static isJsonString(text){
        try{
            JSON.parse(text)
            return true
        }catch(err){
            return false
        }
    }
}

module.exports = () => {
    return JsonUtil
}