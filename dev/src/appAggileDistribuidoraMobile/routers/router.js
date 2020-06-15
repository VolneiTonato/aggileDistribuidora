module.exports = (app) => {


    
    const credentials = {
        userName: process.env.BASIC_AUTH_USER,
        password: process.env.BASIC_AUTH_PW
    }


    let authenticationStatus = (resp) => {
        resp.writeHead(401, { 'WWW-Authenticate': 'Basic realm=Basic Authentication' })
        return resp.end('Authorization is needed')
    
    }

    app.use((req, res, next) => {


        let url = req.originalUrl

    
        if(!/^(\/mobile)/.test(url))
            return next()


        if (!req.headers.authorization) {
            authenticationStatus (res)
            return
        }

        let authentication = req.headers.authorization.replace(/^Basic/, '')

        authentication = (new Buffer(authentication, 'base64')).toString('utf8')

        let loginInfo = authentication.split(':')


        if (loginInfo[0] === credentials.userName && loginInfo[1] === credentials.password) 
            next()
        else
            authenticationStatus (res)

    })



    app.use('/mobile/', require('../controllers/home-controller')(app))
}