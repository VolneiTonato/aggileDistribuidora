const utils = require('../../../helpers/_utils/utils')
const aggileAdminModel = require('../../../models/aggile-admin/aggileAdminModel')

class VendedorController {

    constructor(app) {
        this._app = app

        this._router = require('express').Router()

        this._pathView = `${__dirname}/../views`

        this.registerRouters()

      
        this._vendedorModel = new aggileAdminModel.VendedorModel()

    }

    router(){

        return this._router
    }

    registerRouters(){

        this._router.post('/list', (req, res) => {
            
            this._vendedorModel.pesquisar(req.body).then( (r) => {
                return res.json(r)
            }).catch( (err) => {
                return res.status(500).json({message : utils.ResponseUtil.responseErrorMessage(err)})
            })
        })

        

        this._router.post('/save', (req, res) => {
            this._vendedorModel.createOrUpdate(req.body).then( (r) => {
                return res.json({data: r, message : 'Vendedor salvo com sucesso!'})
            }).catch( (err) => {
                return res.status(500).json({message : utils.ResponseUtil.responseErrorMessage(err)})
            })            
        })
       
    }

}


module.exports = (app) => {
    return new VendedorController(app).router()
}