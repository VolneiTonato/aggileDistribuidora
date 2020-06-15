const utils = require('../../../helpers/_utils/utils')
const aggileAdminModel = require('../../../models/aggile-admin/aggileAdminModel')

class UsuarioController {

    constructor(app) {
        this._app = app

        this._router = require('express').Router()

        this.registerRouters()   
    }

    router(){
        return this._router
    }

    registerRouters(){

        this._router.post('/permissoes-enums', (req, res, next) => {
            return res.json(new aggileAdminModel.UsuarioModel().enumsPermissoes())
        })

        
    }

}


module.exports = (app) => {
    return new UsuarioController(app).router()
}