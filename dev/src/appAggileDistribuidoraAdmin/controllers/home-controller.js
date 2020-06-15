const midlewareSession = require('../../../midleware/middleware')
const model = require('../../../models/aggile-admin/aggileAdminModel')

class HomeController {

    constructor(app) {
        this._app = app

        this._router = require('express').Router()

        this._pathView = `${__dirname}/../views`

        this.registerRouters()

    }

    router() {

        return this._router
    }

    registerRouters() {

        this._router.get('/',midlewareSession.MiddlewareSession.isLoggedIn,  (req, res, next) => {
            
            if ('adminAggile' in req.session && ('tokenAccess' in req.session.adminAggile)) 
                return res.render(`${this._pathView}/layout.pug`, { title: "Administrador Aggile Distribuidora", tokenAccess: req.session.adminAggile.tokenAccess })

            return res.redirect('/admin/auth')
            
        })
    }
}


module.exports = (app) => {
    return new HomeController(app).router()
}