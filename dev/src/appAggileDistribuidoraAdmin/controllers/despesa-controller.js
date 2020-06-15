const utils = require('../../../helpers/_utils/utils')
const aggileAdminModel = require('../../../models/aggile-admin/aggileAdminModel')

class DespesaController {

    constructor(app) {
        this._app = app

        this._router = require('express').Router()

        this._pathView = `${__dirname}/../views`

        this._despesaModel = new aggileAdminModel.DespesaModel()

        this._historicoDespesaModel = new aggileAdminModel.HistoricoDespesaModel()
       
      
        this.registerRouters()
    }

    router(){

        return this._router
    }

    registerRouters(){

        this._router.post('/listar-despesas',  (req, res, next) => {

            this._despesaModel.pesquisar(req.body).then( (r) => {
                return res.json(r)
            }).catch( (err) => {
                return res.status(500).json({message : utils.ResponseUtil.responseErrorMessage(err)})
            })
        })
        
        this._router.post('/save', (req, res, next) => {

            this._despesaModel.createOrUpdate(req.body).then( (r) => {
                return res.json({data : r, message: 'Conta Salva com sucesso!'})
            }).catch( (err) => {
                return res.status(500).json({message : utils.ResponseUtil.responseErrorMessage(err)})
            })
        })

        this._router.post('/obter-conta', (req, res, next) => {


            this._despesaModel.findOne({id: req.body.id}).then( (r) => {
                return res.json(r)
            }).catch( (err) => {
                return res.status(500).json({message : utils.ResponseUtil.responseErrorMessage(err)})
            })
        })


        this._router.post('/cancelar-despesa', (req, res, next) => {


            this._despesaModel.cancelarDespesa(req.body).then( (r) => {
                return res.json(r)
            }).catch( (err) => {
                return res.status(500).json({message : utils.ResponseUtil.responseErrorMessage(err)})
            })
        })

        this._router.post('/pagamento-total', (req, res, next) => {
            
            this._historicoDespesaModel.pagamentoTotal(req.body).then( (r) => {
                return res.json(r)
            }).catch( (err) => {
                return res.status(500).json({message : utils.ResponseUtil.responseErrorMessage(err)})
            })
        })




        this._router.post('/save-historico', (req, res, next) => {
            
            this._historicoDespesaModel.save(req.body).then( (r) => {
                return res.json(r)
            }).catch( (err) => {
                return res.status(500).json({message : utils.ResponseUtil.responseErrorMessage(err)})
            })
        })

        this._router.post('/save-historico-parcela', (req, res, next) => {
            
            this._historicoDespesaModel.saveHistoricoParcelas(req.body).then( (r) => {
                return res.json({parcelas : true})
            }).catch( (err) => {
                return res.status(500).json({message : utils.ResponseUtil.responseErrorMessage(err)})
            })
        })

        this._router.post('/pagamento', (req, res, next) => {
            
            this._historicoDespesaModel.pagamento(req.body).then( (r) => {
                return res.json(r)
            }).catch( (err) => {
                return res.status(500).json({message : utils.ResponseUtil.responseErrorMessage(err)})
            })
        })


        this._router.get('/list-historicos-by-despesa', (req, res, next) => {

            this._historicoDespesaModel.findBy(req.body.data).then( (r) => {
                return res.json(r)
            }).catch( (err) => {
                return res.status(500).json({message : utils.ResponseUtil.responseErrorMessage(err)})
            })
        })        
       
    }

}


module.exports = (app) => {
    return new DespesaController(app).router()
}