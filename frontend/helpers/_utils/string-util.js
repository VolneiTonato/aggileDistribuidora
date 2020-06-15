class StringUtil {

    constructor() {

    }

    static trim(str) {
        return $.trim(str)
    }

    static length(val) {
        try {
            if (typeof val == 'object')
                return StringUtil.trim(val.toString()).length
            return StringUtil.trim(val).length
        } catch (err) {
            return 0
        }
    }

    static stringToBoolean(value) {
        return /(true)/ig.test(value)
    }

    static booleanToString(value) {
        try {
            if (value) {
                if ([true, 'true', 'sim'].toString().indexOf(value) !== -1)
                    return 'SIM'
                throw ''
            }
            throw ''
        } catch (err) {
            return 'NÃO'
        }
    }

    static calcularPaginator(paginator = {}, offset = 10) {
        paginator.limit = paginator.limit
        paginator.offset += offset

        return paginator
    }

    static paginator() {
        return {
            paginator: {
                limit: 10,
                offset: 0
            }
        }
    }

    static uuid() {
        let d = new Date().getTime();
        let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            var r = (d + Math.random() * 16) % 16 | 0
            d = Math.floor(d / 16)
            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16)
        })
        return uuid
    }

    static base64Encode(str = ''){
        try{
            return btoa(str)
        }catch(err){
            return ''
        }
    }

    static base64Decode(str = ''){
        try{
            return atob(str)
        }catch(err){
            return ''
        }
    }

}

module.exports = () => {
    return StringUtil
}