const aggileAdminModel = require('../../../models/aggile-admin/aggileAdminModel')


class PessoaController {

    constructor(app) {
        this._app = app

        this._router = require('express').Router()

        this.registerRouters()

        
    }

    router(){
        return this._router
    }

    registerRouters(){



        this._router.post('/auto-complete-cheque', async (req, res) => {
            (await new aggileAdminModel.ChequeModel()).findByAutoComplete(req.body)
            .then(r => {
                return res.json(r)
            }).catch(err => {
                return res.status(400).send(err.toString())
            }) 
        })


       
        this._router.post('/auto-complete-conta-bancaria', (req, res) => {
            new aggileAdminModel.ContaBancariaModel().findByAutoComplete(req.body.pesquisa)
            .then(r => {
                return res.json(r)
            }).catch(err => {
                return res.status(400).send(err.toString())
            }) 
        })
       

        this._router.post('/fabricas', (req, res) => {
            
            new aggileAdminModel.FabricaModel()._model.findAll().then( (r) => {
                return res.json(r)
            }).catch( (err) => {
                return res.status(500).send()
            })
        })


        this._router.post('/auto-complete-cliente', (req, res) => {
            
            new aggileAdminModel.ClienteModel().findByAutoComplete(req.body.pesquisa).then( (r) => { 
                return res.json(r)
            }).catch( (err) => { 
                return res.status(500).send(err.toString()) 
            })
        })


        this._router.post('/auto-complete-cedente', (req, res) => {
            
            new aggileAdminModel.CedenteModel().findByAutoComplete(req.body.pesquisa).then( (r) => { 
                return res.json(r)
            }).catch( (err) => { 
                return res.status(500).send(err.toString()) 
            })
        })


        this._router.post('/auto-complete-vendedor', (req, res) => {
            
            new aggileAdminModel.VendedorModel().findByAutoComplete(req.body.pesquisa).then( (r) => { 
                return res.json(r)
            }).catch( (err) => { 
                return res.status(500).send(err.toString()) 
            })
        })

        this._router.post('/auto-complete-fabrica', (req, res) => {
            
            new aggileAdminModel.FabricaModel().findByAutoComplete(req.body.pesquisa).then( (r) => { 
                return res.json(r)
            }).catch( (err) => { 
                return res.status(500).send(err.toString()) 
            })
        })


        this._router.post('/auto-complete-agencia', (req, res) => {
            
            new aggileAdminModel.AgenciaModel().findByAutoComplete(req.body.pesquisa).then( (r) => { 
                return res.json(r)
            }).catch( (err) => { 
                return res.status(500).send(err.toString()) 
            })
        })

        
        
    }

}


module.exports = (app) => {
    return new PessoaController(app).router()
}