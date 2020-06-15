
const redis = require('redis')
const bluebird = require('bluebird')
const connectRedis = require('connect-redis')
const redisStoreLimit = require('rate-limit-redis')


bluebird.promisifyAll(redis)


let cache = redis.createClient({ host: process.env.REDIS_DB })

cache.on('error', (err) => {
    console.log(err)
})

cache.on('connect', () => {
    
})


class RedisUtil{


    static async delete(key){
        return await cache.del(key)
    }

    static async get(key){
        return await cache.getAsync(key)
    }

    static async set(key, value){
        if(typeof value === 'object')
            return await cache.set(key, JSON.stringify(value))
        else
            return await cache.set(key, value)

        
        
    }

    static getStoreLimit(){
        return new redisStoreLimit({
            client: cache
        })
    }

    static getStoreSession(session){
        return connectRedis(session)
    }
}


module.exports = RedisUtil