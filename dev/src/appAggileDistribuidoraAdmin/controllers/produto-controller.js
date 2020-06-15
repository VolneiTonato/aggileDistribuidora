const utils = require('../../../helpers/_utils/utils')
const aggileAdminModel = require('../../../models/aggile-admin/aggileAdminModel')
const middleware = require('../../../midleware/middleware')

class ProdutoController {

    constructor(app) {
        this._app = app

        this._router = require('express').Router()

        this._pathView = `${__dirname}/../views`

        this.registerRouters()

        this._produtoModel = new aggileAdminModel.ProdutoModel()
    }

    router(){

        return this._router
    }

    registerRouters(){

        this._router.post('/list', middleware.MiddlewareQuerySearch, (req, res) => {
            
            this._produtoModel.pesquisar(req.body).then( (r) => {
                return res.json(r)
            }).catch( (err) => {
                return res.status(500).json({message : utils.ResponseUtil.responseErrorMessage(err)})
            })
        })

    

        this._router.post('/save', (req, res) => {
            this._produtoModel.createOrUpdate(req.body).then( (r) => {
                return res.json({data: r, message : 'Produto salvo com sucesso!'})
            }).catch( (err) => {
                return res.status(500).json({message : utils.ResponseUtil.responseErrorMessage(err)})
            })            
        })


        this._router.post('/save-ecommerce', (req, res) => {
            this._produtoModel.saveToEcommece(req.body).then( (r) => {
                return res.json({data: r, message : 'Produto salvo com sucesso!'})
            }).catch( (err) => {
                return res.status(500).json({message : utils.ResponseUtil.responseErrorMessage(err)})
            })            
        })
       
    }

}


module.exports = (app) => {
    return new ProdutoController(app).router()
}