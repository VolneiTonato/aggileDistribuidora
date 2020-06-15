const utils = require('../../../helpers/_utils/utils')
const aggileAdminModel = require('../../../models/aggile-admin/aggileAdminModel')

class FabricaController {

    constructor(app) {
        this._app = app

        this._router = require('express').Router()

        this._pathView = `${__dirname}/../views`

        this.registerRouters()

        this._fabricaModel = new aggileAdminModel.FabricaModel()
    }

    router(){

        return this._router
    }

    registerRouters(){

        this._router.post('/list', (req, res) => {
            this._fabricaModel.pesquisar(req.body).then( (r) => {
                return res.json(r)
            }).catch( (err) => {
                return res.status(500).json({message : utils.ResponseUtil.responseErrorMessage(err)})
            })
        })

        this._router.post('/save', (req, res) => {
            this._fabricaModel.createOrUpdate(req.body).then( (r) => {
                return res.json({data: r, message : 'Fábrica salva com sucesso!'})
            }).catch( (err) => {
                return res.status(500).json({message : utils.ResponseUtil.responseErrorMessage(err)})
            })            
        })
       
    }

}


module.exports = (app) => {
    return new FabricaController(app).router()
}