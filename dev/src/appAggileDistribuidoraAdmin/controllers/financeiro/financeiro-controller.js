const utils = require('../../../../helpers/_utils/utils')
const aggileAdminModel = require('../../../../models/aggile-admin/aggileAdminModel')
const middleware = require('../../../../midleware/middleware')

class FinanceiroController {

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

        this._router.use('/bancos/', require('./sub-controllers/banco-controller')(this._app))
        this._router.use('/agencias/', require('./sub-controllers/agencia-controller')(this._app))
        this._router.use('/contas-bancarias/', require('./sub-controllers/conta-bancaria-controller')(this._app))
        this._router.use('/cheques/', require('./sub-controllers/cheque-controller')(this._app))

    }
}


module.exports = (app) => {
    return new FinanceiroController(app).router()
}