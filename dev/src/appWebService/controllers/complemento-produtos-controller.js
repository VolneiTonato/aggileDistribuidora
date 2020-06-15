const utils = require('../../../helpers/_utils/utils')
const aggileAdminModel = require('../../../models/aggile-admin/aggileAdminModel')
const UIService = require('../../../services/uiApi/uiApiService')

class ComplementoProdutosController {

    constructor(app) {
        this._app = app

        this._router = require('express').Router()

        this.registerRouters()

        
    }

    router(){
        return this._router
    }

    registerRouters(){

        this._router.post('/auto-complete', (req, res) => {
            new aggileAdminModel.ProdutoModel().findByAutoComplete(req.body.pesquisa).then( (r) => { 
                return res.json(r)
            }).catch( (err) => { 
                return res.status(500).send(err.toString()) 
            })
        })

        this._router.post('/grupos-combobox-tree-view', (req, res) => {

            UIService.JQXTree.comboBoxGruposTreeView(null, 0, req.body.grupoPaiSelecionado, req.body.options).then( (data) => {
                return res.json(data)
            }).catch( (err) => {
                return res.status(500).send(err.toString())
            })
        })

        this._router.post('/tipos-unidades', (req, res) => {
            
            new aggileAdminModel.TipoUnidadeModel()._model.findAll().then( (r) => {
                if(!r)
                    return res.status(500).send()
                res.json(r)
            }).catch( (err) => {
                res.status(500).send()
            })
        })

        this._router.post('/volumes', (req, res) => {
            
            new aggileAdminModel.VolumeModel()._model.findAll().then( (r) => {
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
    return new ComplementoProdutosController(app).router()
}