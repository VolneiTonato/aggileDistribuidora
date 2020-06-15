const utils = require('../../../helpers/_utils/utils')
const aggileAdminModel = require('../../../models/aggile-admin/aggileAdminModel')

class EstadoMunicipioController {

    constructor(app) {
        this._app = app

        this._router = require('express').Router()

        this.registerRouters()

        
    }

    router(){
        return this._router
    }

    registerRouters(){

        this._router.get('/estados/:uf', (req, res) => {
            
            new aggileAdminModel.EstadoModel()._model.findOne({where : {uf : req.params.uf}}).then( (r) => {
                if(!r)
                    return res.status(500).send()

                res.json(r)
            }).catch( (err) => {
                res.status(500).send()
            })
        })

        this._router.get('/municipios/:estadoId', (req, res) => {
            
            new aggileAdminModel.MunicipioModel()._model.findAll({where : {estado_id : req.params.estadoId}}).then( (r) => {
                
                if(!r)
                    return res.status(500).send()

                res.json(r)
            }).catch( (err) => {
                
                res.status(500).send()
            })
        })
        
    }

}


module.exports = (app) => {
    return new EstadoMunicipioController(app).router()
}