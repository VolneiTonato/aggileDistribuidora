const utils = require('../../../helpers/_utils/utils')
const aggileAdminModel = require('../../../models/aggile-admin/aggileAdminModel')

class ClienteController {

    constructor(app) {
        this._app = app

        this._router = require('express').Router()

        this._pathView = `${__dirname}/../views`

        this.registerRouters()

      
        this._clienteModel = new aggileAdminModel.ClienteModel()

    }

    router(){

        return this._router
    }

    registerRouters(){

        this._router.post('/list', (req, res) => {
            
            this._clienteModel.pesquisar(req.body).then( (r) => {
                return res.json(r)
            }).catch( (err) => {
                return res.status(500).json({message : utils.ResponseUtil.responseErrorMessage(err)})
            })
        })

        

        this._router.post('/save', (req, res) => {
            this._clienteModel.createOrUpdate(req.body).then( (r) => {
                return res.json({data: r, message : 'Cliente salvo com sucesso!'})
            }).catch( (err) => {
                return res.status(500).json({message : utils.ResponseUtil.responseErrorMessage(err)})
            })            
        })
       
    }

}


module.exports = (app) => {
    return new ClienteController(app).router()
}