const utils = require('../../../helpers/_utils/utils')
const aggileAdminModel = require('../../../models/aggile-admin/aggileAdminModel')

class VolumeController {

    constructor(app) {
        this._app = app

        this._router = require('express').Router()

        this._pathView = `${__dirname}/../views`

        this.registerRouters()

        this._volumeModel = new aggileAdminModel.VolumeModel()
    }

    router(){

        return this._router
    }

    registerRouters(){

        this._router.post('/list', (req, res) => {
            this._volumeModel.pesquisar(req.body).then( (r) => {
                return res.json(r)
            }).catch( (err) => {
                return res.status(500).json({message : utils.ResponseUtil.responseErrorMessage(err)})
            })
        })

        this._router.post('/save', (req, res) => {
            this._volumeModel.createOrUpdate(req.body).then( (r) => {
                return res.json({data: r, message : 'Volume salvo com sucesso!'})
            }).catch( (err) => {
                return res.status(500).json({message : utils.ResponseUtil.responseErrorMessage(err)})
            })            
        })
       
    }

}


module.exports = (app) => {
    return new VolumeController(app).router()
}