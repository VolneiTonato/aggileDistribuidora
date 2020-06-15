const time = (ms) => {
    return new Promise( (resolve, reject) => {
        setTimeout(() => {
            return resolve()
        }, ms);
    })
}



class TimeUtil {
  
        static sleepSync(ms){
            
            return new Promise(  (resolve, reject) => {
                time(ms).then( () => {
                    return resolve()
                })
            })

        }
    
}


module.exports = TimeUtil