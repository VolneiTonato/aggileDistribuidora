class ObjectUtil {

    constructor() {

    }

    static deleteProperty(obj, property){
        try{
            delete obj[property]
        }catch(err){

        }
    }

    static hasProperty(obj, property) {
        try {
            return Object.prototype.hasOwnProperty.call(obj, property)
        } catch (e) {
            return false
        }
    }

    static get(obj, property) {
        if (this.hasProperty(obj, property))
            return obj[property]

        return undefined


    }

    static isObject(obj) {
        return typeof obj === 'object'
    }

    static getValueProperty(obj, key) {

        try {

            if (!this.isObject(obj))
                return ''

            if (this.hasProperty(obj, key))
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

module.exports = ObjectUtil