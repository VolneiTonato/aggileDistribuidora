const utils = require('../../../helpers/_utils/utils')
const aggileAdminModel = require('../../../models/aggile-admin/aggileAdminModel')

class HomeController {

    constructor(app) {
        this._app = app

        this._router = require('express').Router()

        this._pathView = `${__dirname}/../views`

        this.registerRouters()   
    }

    router(){
        return this._router
    }

    registerRouters(){

        this._router.get('/', (req, res) => {
            return res.render(`${this._pathView}/home/index.pug`)
        })

        
    }

}


module.exports = (app) => {
    return new HomeController(app).router()
}