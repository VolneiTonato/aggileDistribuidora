const utils = require('../../../helpers/_utils/utils')
const enums = require('../../../models/aggile-admin/includes/enuns/enum')

class MovimentacaoController {

    constructor(app) {
        this._app = app

        this._router = require('express').Router()

        this.registerRouters()   
    }

    router(){
        return this._router
    }

    registerRouters(){

        

        
    }

}


module.exports = (app) => {
    return new MovimentacaoController(app).router()
}