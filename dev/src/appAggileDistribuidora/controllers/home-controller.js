//const taskOnly = require('./tasks/task-online')
const _ = require('lodash')

class HomeController {
    constructor(app){
        this._app = app

        this._router = require('express').Router()

        this._pathView = `${__dirname}/../views`

        this.registerRouters()

        this.tasks()
        
    }

    tasks(){
       // taskOnly()
    }

    router(){
        return this._router
    }

    registerRouters(){

        this._router.get('/', (req, res, next) => {
            let token = ('adminAggile' in req.session && ('tokenAccess' in req.session.adminAggile)) ? req.session.adminAggile.tokenAccess : ''

            if(req.isAuthenticated())
                return res.redirect('/admin')
            


            return res.render(`${this._pathView}/home/home.pug`, {tokenAccess : token})
        })


        this._router.get('/obter-auth-validation', (req, res) => {
            
            let messages = req.flash('loginMessage')
            
            let token = _.get(req, 'session.adminAggile.tokenAccess')

            if(_.isArray(messages))
                messages = messages.join(' -- ')

            if(token && !messages)
                return res.send({login: true, token : token})
            else
                return res.send({login: false, message: messages})
        })


    }

}


module.exports = (app) => { return new HomeController(app).router() }


