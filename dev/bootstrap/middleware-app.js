const util = require('../helpers/_utils/utils')
const session = require('express-session')
const mongoDbStore = require('connect-mongodb-session')(session)
const RateLimit = require('express-rate-limit')
const crypto = require('crypto')




const limiter = new RateLimit({
    store: util.RedisUtil.getStoreLimit(),
    max: 100, // limit each IP to 100 requests per windowMs
    delayMs: 0 // disable delaying - full speed until the max limit is reached
})

const localsFunctions = {
    _: require('lodash'),
    NumberUtil: require('../helpers/_utils/repo/number-util'),
    DateUtil: require('../helpers/_utils/repo/date-util'),
    ObjectUtil: require('../helpers/_utils/repo/object-util'),
    JsonUtil: require('../helpers/_utils/repo/json-util'),
    StringUtil: require('../helpers/_utils/repo/string-util'),
    UUID : ()  => { 
        const uuid = require('../helpers/_utils/repo/crypt-util')
        return uuid.uuid()
    }
}

let store



class SetupService {

    constructor(app) {


        

        app.use(limiter)


     

        app.use((req, res, next) => {

            res.locals = localsFunctions
            global.functionView = res.locals
            next()
        })


        

        process.env.hashSecurity = crypto.randomBytes(50).toString('hex')

        
        app.use((req, res, next) => {
            
            try {
                let _send = res.send
                let sent = false

                res.send = (data) => {
                    if (sent) return

                    _send.bind(res)(data)

                    sent = true
                }

                next()

            } catch (e) {
                next()
            }

        })


        app.use(require('express-flash')())

        app.set('view engine', 'pug')

        store = new mongoDbStore({
            uri: `${process.env.MONGO_DB}/${process.env.DATABASE_SESSION_MONGODB}`,
            collection: 'session-aggile-admin'
        })

        store.on('error', (err) => {
            console.debug(`connection mongodb ${err}`)
        })


        let secure = process.env.IS_AMAZON_SERVER === 'true'

        app.set('trust proxy', 1)



        app.use(session({
            secret: process.env.SESSION_KEY,
            name: process.env.SESSION_NAME,
            resave: false,
            saveUninitialized: false,
            store: store,
            secure: secure,
        }))


    }
}

module.exports = (app) => {
    return new SetupService(app)
} 