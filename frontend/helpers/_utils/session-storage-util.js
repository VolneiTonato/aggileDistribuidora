class SessionStorageUtil{

    static isSessionStorage(){
        return window['sessionStorage'] && (window['sessionStorage'] !== null)
    }


    
    static getStorage(key = '', isJson = true){
        if(!SessionStorageUtil.isSessionStorage())
            return null

        let now = Date.now()

        try{
            key = key.replace(/"/ig,'')
        }catch(err){
            
        }
        
        let expiresIn = window['sessionStorage'].getItem(`__cache__${key}_expiresIn`)
        if (expiresIn===undefined || expiresIn===null) { expiresIn = 0 }
    
        if (expiresIn < now) {
            SessionStorageUtil.removeStorage(`__cache__${key}`)
            SessionStorageUtil.removeStorage(`__cache__${key}_expiresIn`)
            return null
        }

        let data = window['sessionStorage'].getItem(`__cache__${key}`)

        if(data == null || ( data[0] == null ))
            return null

        


        return isJson == true ? JSON.parse(data) : data
    }


    static isStorageItem(key){
        if(!SessionStorageUtil.isSessionStorage())
            return false

        let data = SessionStorageUtil.getStorage(`__cache__${key}`, false)        
       
        return data !== null && (data.length > 0)
    }

    static setStorage(key, value, expires = (24*60*60*5) , isJson = true){
        if(!SessionStorageUtil.isSessionStorage())
            return null

        key = key.replace(/"/ig,'')
        
        window['sessionStorage'].setItem(`__cache__${key}`, isJson == true ? JSON.stringify(value) : value)

        if(expires){

            expires = Math.abs(expires)
            let now = Date.now()  //millisecs since epoch time, lets deal only with integer
            let schedule = now + expires * 1000
            window['sessionStorage'].setItem(`__cache__${key}_expiresIn`, schedule)
        }


        
    }

    static clear(){
        if(!SessionStorageUtil.isSessionStorage())
            return null

        window['sessionStorage'].clear()
    }

    static removeStorage(key){

        if(!key)
            return null


        if(!SessionStorageUtil.isSessionStorage())
            return null


        try{
            key = key.replace(/"/ig,'')
        }catch(err){

        }
        
        window['sessionStorage'].removeItem(`__cache__${key}`)
        window['sessionStorage'].removeItem(`__cache__${key}_expiresIn`)
    }

    
}


module.exports = SessionStorageUtil