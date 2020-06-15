class PromiseUtil{
    

    static async to(promise){

        if(!promise instanceof Promise)
            return promise

        return promise.then( data => {

            if(data instanceof Error)
                return [data.message]

            return [null, data]
        })
        .catch(err => [err])
    }

    static async sleep(ms = 1000){

        return new Promise(resolve => { return setTimeout(resolve, ms)})

    }
}

module.exports = PromiseUtil