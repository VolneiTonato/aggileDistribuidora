const async = require("async")

let time = 1000 * 60


const loopClientOnlyAsync = (url) => {
    
    async.waterfall([
        (next) => {
            $.ajax({
                url: url
            }).done((r) => {
                next(null, true)
            }).fail((e) => {
                next(null, false)
            })
        },
        
    ], (err, success) => {

        if(success == false){
            
        }else{
            setTimeout(() => {
                loopClientOnlyAsync()
            }, time)
        }
    })
}



class ClientUtil {

    static eventLoopCheckClientOnly(url) {
        loopClientOnlyAsync(url)
    }
}

module.exports = () => {
    return ClientUtil
}