class LocalStorageUtil{

    static isLocalStorate(){
        return window['localStorage'] && (window['localStorage'] !== null)
    }
    
    static getStorage(key, isJson = true){
        if(!this.isLocalStorate())
            return null

        let now = Date.now()
        
        let expiresIn = window['localStorage'].getItem(`${key}_expiresIn`)
        if (expiresIn===undefined || expiresIn===null) { expiresIn = 0 }
    
        if (expiresIn < now) {
            this.removeStorage(`${key}`)
            this.removeStorage(`${key}_expiresIn`)
            return null
        }

        let data = window['localStorage'].getItem(`${key}`)

        if(data == null || ( data[0] == null ))
            return null

        

        try{
            return isJson == true ? JSON.parse(data) : data
        }catch(err){
            return {}
        }
    }


    static isStorageItem(key){
        if(!this.isLocalStorate())
            return false

        let data = this.getStorage(`${key}`, false)        
       
        return data !== null && (data.length > 0)
    }

    static setStorage(key, value, expires = (24*60*60*5) , isJson = true){
        if(!this.isLocalStorate())
            return null
        
        window['localStorage'].setItem(`${key}`, isJson == true ? JSON.stringify(value) : value)

        if(expires){

            expires = Math.abs(expires)
            let now = Date.now()  //millisecs since epoch time, lets deal only with integer
            let schedule = now + expires * 1000
            window['localStorage'].setItem(`${key}_expiresIn`, schedule)
        }


        
    }

    static clear(){
        if(!this.isLocalStorate())
            return null

        window['localStorage'].clear()
    }

    static removeStorage(key){
        if(!this.isLocalStorate())
            return null
        
        window['localStorage'].removeItem(`${key}`)
        window['localStorage'].removeItem(`${key}_expiresIn`)
    }

    
}


module.exports = LocalStorageUtil