const utils = require('../../../helpers/_utils/utils')
const aggileAdminModel = require('../../../models/aggile-admin/aggileAdminModel')

class CedenteController {

    constructor(app) {
        this._app = app

        this._router = require('express').Router()

        this._pathView = `${__dirname}/../views`

        this.registerRouters()

        this._cedenteModel = new aggileAdminModel.CedenteModel()
    }

    router(){

        return this._router
    }

    registerRouters(){

        this._router.post('/list', (req, res, next) => {
            
            this._cedenteModel.pesquisar(req.body).then( (r) => {
                return res.json(r)
            }).catch( (err) => {
                return res.status(500).json({message : utils.ResponseUtil.responseErrorMessage(err)})
            })
        })

        this._router.post('/save', (req, res) => {
            this._cedenteModel.createOrUpdate(req.body).then( (r) => {
                return res.json({data: r, message : 'Cedente salvo com sucesso!'})
            }).catch( (err) => {
                return res.status(500).json({message : utils.ResponseUtil.responseErrorMessage(err)})
            })            
        })
       
    }

}


module.exports = (app) => {
    return new CedenteController(app).router()
}