const utils = require('../../../helpers/_utils/utils')
const aggileAdminModel = require('../../../models/aggile-admin/aggileAdminModel')

class EntradaController {

    constructor(app) {
        this._app = app

        this._router = require('express').Router()

        this._pathView = `${__dirname}/../views`


        this._notaEntradaModel  = new aggileAdminModel.NotaEntradaModel()
        
        this._itemNotaEntradaModel = new aggileAdminModel.ItemNotaEntradaModel()


        this.registerRouters()
    }

    router(){

        return this._router
    }

    registerRouters(){

        this._router.post('/save', (req, res, next) => {
            this._notaEntradaModel.createOrUpdate(req.body, req.user).then( (r) => {
                return res.json({data : r, message: 'Nota Salva com sucesso!'})
            }).catch( (err) => {
                return res.status(500).json({message : utils.ResponseUtil.responseErrorMessage(err)})
            })
        })

        this._router.post('/cancelar-nota-fiscal', (req, res, next) => {
            this._notaEntradaModel.cancelarNotaFiscal(req.body).then( (r) => {
                return res.json({data : {lancamento: true}, message: `Nota Fiscal Nº ${req.body.id} ${req.body.isEstorno == 'true' ? 'estornada' : 'cancelada'}!`})
            }).catch( (err) => {
                return res.status(500).json({message : utils.ResponseUtil.responseErrorMessage(err)})
            })
        })

        this._router.post('/listar-notas', (req, res, next) => {
            this._notaEntradaModel.pesquisar(req.body).then( (r) => {
                return res.json(r)
            }).catch( (err) => {
                return res.status(500).json({message : utils.ResponseUtil.responseErrorMessage(err)})
            })
        })

        this._router.post('/save-item', (req, res, next) => {
            this._itemNotaEntradaModel.saveItemNota(req.body).then( (r) => {
                return res.json(r)
            }).catch( (err) => {
                return res.status(500).json({message : utils.ResponseUtil.responseErrorMessage(err)})
            })
        })

        this._router.post('/remove-item', (req, res, next) => {
            this._itemNotaEntradaModel.removeItemNota(req.body).then( (r) => {
                return res.json({data : true})
            }).catch( (err) => {
                return res.status(500).json({message: utils.ResponseUtil.responseErrorMessage(err)})
            })
        })

   
       
    }

}


module.exports = (app) => {
    return new EntradaController(app).router()
}