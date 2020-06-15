const utils = require('../../../../../helpers/_utils/utils')

class AgenciaController {

    constructor(app) {
        this._app = app



        this._router = require('express').Router()

        this._pathView = `${__dirname}/../views`   

        process.nextTick(() => {
            this._agenciaModel = new (require('../../../../../models/aggile-admin/aggileAdminModel').AgenciaModel)()
        })

        this.registerRouters()
    }

    router(){

        return this._router
    }

    registerRouters(){

        this._router.post('/list',  (req, res) => {

            this._agenciaModel.pesquisar(req.body).then( (r) => {
                return res.json(r)
            }).catch( (err) => {
                return res.status(500).json({message : utils.ResponseUtil.responseErrorMessage(err)})
            })
        })
        
        this._router.post('/save', (req, res) => {
            
            this._agenciaModel.createOrUpdate(req.body).then( (r) => {
                return res.json({data : r, message: 'Agência Salva com sucesso!'})
            }).catch( (err) => {
                return res.status(500).json({message : utils.ResponseUtil.responseErrorMessage(err)})
            })
        })

        this._router.post('/obter', (req, res) => {


            this._agenciaModel.findOne({id: req.body.id}).then( (r) => {
                return res.json(r)
            }).catch( (err) => {
                return res.status(500).json({message : utils.ResponseUtil.responseErrorMessage(err)})
            })
        })


        
    }
}


module.exports = (app) => {
    return new AgenciaController(app).router()
}