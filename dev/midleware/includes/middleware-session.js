const aggileSessionIncludeModel = require('../../models/aggile-session/aggileSessionIncludeModel')


module.exports.serviceWorker = (req, res, next) => {

    
    let url = req.originalUrl

    let key = undefined



    if (!/^(\/admin\/auth)(\/)?/.test(url) && !/^(\/service-worker-aggile-distribuidora-all)/.test(url)) {

        
        req.rawHeaders.forEach((item) => {

            if (/(\/service-worker-aggile-distribuidora-all\?securityTokenWorkerServerAdmin)/ig.test(item))
                key = item.replace(/(.+)(\/service-worker-aggile-distribuidora-all\?securityTokenWorkerServerAdmin=)/, '')
        })
     
    }

    if (key !== undefined) {



        new aggileSessionIncludeModel.SessionAdminModel().obter({ tokenAccess: key })
            .then((data) => {


                if (data && (key == data.tokenAccess)) {
                    if (!req.session.adminAggile)
                        req.session.adminAggile = {}
                    req.session.adminAggile.isAuthSecurityServiceWorker = true
                    req.session.adminAggile.tokenAccess = data.tokenAccess
                } else {
                    req.session.adminAggile = {}
                }

                return next()
            })
            .catch((err) => {
                return next()
            })


    } else {
        return next()
    }

}

module.exports.isLoggedIn = (req, res, next) => {

   

    if ('adminAggile' in req.session && ('tokenAccess' in req.session.adminAggile))
        return next()


    if (req.isAuthenticated())
        return next()


    res.redirect('/admin/auth')
}