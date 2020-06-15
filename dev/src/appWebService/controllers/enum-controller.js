const utils = require('../../../helpers/_utils/utils')
const aggileAdminModel = require('../../../models/aggile-admin/aggileAdminModel')
const enums = require('../../../models/aggile-admin/includes/enuns/enum')

class EnumController {

    constructor(app) {
        this._app = app

        this._router = require('express').Router()

        this.registerRouters()   
    }

    router(){
        return this._router
    }

    registerRouters(){

        this._router.post('/status-pedido', (req, res) => {
            return res.json(enums.EnumStatusPedido)
        })

        this._router.post('/status-recebimentos', (req, res) => {
            return res.json(enums.EnumStatusRecebimento)
        })

        this._router.post('/status-nota-fiscal', (req, res) => {
            return res.json(enums.EnumStatusNotaFiscal)
        })

        this._router.post('/formas-pagamento', (req, res, next) => {
            return res.json(enums.EnumFormaPagamento)
        })

        
    }

}


module.exports = (app) => {
    return new EnumController(app).router()
}