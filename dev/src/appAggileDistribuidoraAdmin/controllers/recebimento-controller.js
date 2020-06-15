const utils = require('../../../helpers/_utils/utils')
const aggileAdminModel = require('../../../models/aggile-admin/aggileAdminModel')

class RecebimentoController {

    constructor(app) {
        this._app = app

        this._router = require('express').Router()

        this._pathView = `${__dirname}/../views`

        this._recebimentoModel = new aggileAdminModel.RecebimentoModel()

        this._historicoRecebimentoModel = new aggileAdminModel.HistoricoRecebimentoModel()
       


        this.registerRouters()
    }

    router(){

        return this._router
    }

    registerRouters(){

        this._router.post('/listar-receitas',  (req, res, next) => {

            this._recebimentoModel.pesquisar(req.body).then( (r) => {
                return res.json(r)
            }).catch( (err) => {
                return res.status(500).json({message : utils.ResponseUtil.responseErrorMessage(err)})
            })
        })
        
        this._router.post('/save', (req, res, next) => {
            
            this._recebimentoModel.createOrUpdate(req.body).then( (r) => {
                return res.json({data : r, message: 'Conta Salva com sucesso!'})
            }).catch( (err) => {
                return res.status(500).json({message : utils.ResponseUtil.responseErrorMessage(err)})
            })
        })

        this._router.post('/obter-conta', (req, res, next) => {


            this._recebimentoModel.findOne({id: req.body.id}).then( (r) => {
                return res.json(r)
            }).catch( (err) => {
                return res.status(500).json({message : utils.ResponseUtil.responseErrorMessage(err)})
            })
        })


        this._router.post('/cancelar-receita', (req, res, next) => {


            this._recebimentoModel.cancelarReceita(req.body).then( (r) => {
                return res.json(r)
            }).catch( (err) => {
                return res.status(500).json({message : utils.ResponseUtil.responseErrorMessage(err)})
            })
        })

        this._router.post('/recebimento-total', (req, res, next) => {
            
            this._historicoRecebimentoModel.recebimentoTotal(req.body).then( (r) => {
                return res.json(r)
            }).catch( (err) => {
                return res.status(500).json({message : utils.ResponseUtil.responseErrorMessage(err)})
            })
        })




        this._router.post('/save-historico', (req, res, next) => {
            
            this._historicoRecebimentoModel.save(req.body).then( (r) => {
                return res.json(r)
            }).catch( (err) => {
                return res.status(500).json({message : utils.ResponseUtil.responseErrorMessage(err)})
            })
        })


        this._router.post('/save-historico-parcela', (req, res, next) => {
            
            this._historicoRecebimentoModel.saveHistoricoParcelas(req.body).then( (r) => {
                return res.json({parcelas : true})
            }).catch( (err) => {
                return res.status(500).json({message : utils.ResponseUtil.responseErrorMessage(err)})
            })
        })

        this._router.post('/recebimento', (req, res, next) => {
            
            this._historicoRecebimentoModel.recebimento(req.body).then( (r) => {
                return res.json(r)
            }).catch( (err) => {
                return res.status(500).json({message : utils.ResponseUtil.responseErrorMessage(err)})
            })
        })


        this._router.get('/list-historicos-by-recebimento', (req, res, next) => {

            this._historicoRecebimentoModel.findBy(req.body.data).then( (r) => {
                return res.json(r)
            }).catch( (err) => {
                return res.status(500).json({message : utils.ResponseUtil.responseErrorMessage(err)})
            })
        })        
       
    }

}


module.exports = (app) => {
    return new RecebimentoController(app).router()
}