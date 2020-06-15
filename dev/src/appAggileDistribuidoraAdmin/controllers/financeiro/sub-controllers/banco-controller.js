const utils = require('../../../../../helpers/_utils/utils')

class BancoController {

    constructor(app) {
        this._app = app



        this._router = require('express').Router()

        this._pathView = `${__dirname}/../views`   

        process.nextTick(() => {
            this._bancoModel = new (require('../../../../../models/aggile-admin/aggileAdminModel').BancoModel)()
        })

        this.registerRouters()
    }

    router(){

        return this._router
    }

    registerRouters(){

        this._router.post('/listar',  (req, res) => {

            this._bancoModel.pesquisar(req.body).then( (r) => {
                return res.json(r)
            }).catch( (err) => {
                return res.status(500).json({message : utils.ResponseUtil.responseErrorMessage(err)})
            })
        })
        
        this._router.post('/save', (req, res) => {
            
            this._bancoModel.createOrUpdate(req.body).then( (r) => {
                return res.json({data : r, message: 'Conta Salva com sucesso!'})
            }).catch( (err) => {
                return res.status(500).json({message : utils.ResponseUtil.responseErrorMessage(err)})
            })
        })

        this._router.post('/obter', (req, res) => {


            this._bancoModel.findOne({id: req.body.id}).then( (r) => {
                return res.json(r)
            }).catch( (err) => {
                return res.status(500).json({message : utils.ResponseUtil.responseErrorMessage(err)})
            })
        })


        
    }
}


module.exports = (app) => {
    return new BancoController(app).router()
}