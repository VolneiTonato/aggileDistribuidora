class ObjectUtil {

    constructor() {

    }

    static is(obj = {}, property) {
        try {
            if (this.hasProperty(obj, property) && obj[property].toString().length > 0)
                return true
            return false
        } catch (err) {
            return false
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

    static keysMapBreadCrumb(obj, properties) {

        for (var property in obj) {
            if (obj.hasOwnProperty(property)) {
                if (typeof obj[property] == "object") {

                    ObjectUtil.keysMapBreadCrumb(obj[property], properties)
                }
                else {

                    
                }
            }
        }
    }

    static clone(obj) {
        try {
            return Object.assign({}, obj)
        } catch (err) {
            return obj
        }
    }

    static length(obj) {
        try {
            return Object.getOwnPropertyNames(obj).length
        } catch (err) {
            return 0
        }
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


    static isObject(obj) {
        return typeof obj === 'object'
    }
}

module.exports = () => {
    return ObjectUtil
}