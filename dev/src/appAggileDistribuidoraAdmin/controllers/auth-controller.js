const utils = require('../../../helpers/_utils/utils')
const includeAggileSessionModel = require('../../../models/aggile-session/aggileSessionIncludeModel')


class AuthController {

    constructor(app) {
        this._app = app

        this._passport = this._app.get("passport")

        this._router = require('express').Router()

        this._pathView = `${__dirname}/../views`

        this.registerRouters()
    }

    router() {

        return this._router
    }

    registerRouters() {

        this._router.get('/', (req, res, next) => {
            
            if ('adminAggile' in req.session && ('tokenAccess' in req.session.adminAggile))
                return res.redirect('/admin')

            return res.redirect('/')
        })

        

        this._router.post('/proccess-login', this._passport.authenticate('local-login', {
            successRedirect: '/admin',
            failureRedirect: '/',
            failureFlash: true
        }))
        

        this._router.get('/logout', (req, res, next) => {
            
            if(!utils.ObjectUtil.getValueProperty(req, 'session.adminAggile.tokenAccess'))
                return res.redirect('/admin/auth')


            new includeAggileSessionModel.SessionAdminModel().removeToToken(req.session.adminAggile.tokenAccess)
                .then((success) => {
                    req.session.adminAggile = {}
                    req.session.destroy((err) => {
                        req.logout()
                        return res.redirect('/admin/auth')
                    })
                })
        })

    }

}


module.exports = (app) => {
    return new AuthController(app).router()
}