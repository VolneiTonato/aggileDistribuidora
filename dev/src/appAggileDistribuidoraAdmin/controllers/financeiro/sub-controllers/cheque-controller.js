const utils = require('../../../../../helpers/_utils/utils')

const _ = require('lodash')

class ChequeController {

    constructor(app) {
        this._app = app

        this._router = require('express').Router()

        this._pathView = `${__dirname}/../views`

        process.nextTick(() => {
            const model =  require('../../../../../models/aggile-admin/aggileAdminModel')
            this._chequeModel = new model.ChequeModel()
            this._historicoModel = new model.HistoricoChequeModel()
        })

        this.registerRouters()
    }

    router() {

        return this._router
    }

    registerRouters() {
        
        this._router.post('/list', (req, res) => {
            this._chequeModel.pesquisar(req.body).then((r) => {
                return res.json(r)
            }).catch((err) => {
                return res.status(500).json({ message: utils.ResponseUtil.responseErrorMessage(err) })
            })
        })


        this._router.post('/obter-movimentacao-contas-cheque', (req, res) => {
            this._chequeModel.obterContasVinculadasHistoricoCheque(req.body).then((r) => {
                return res.json(r)
            }).catch((err) => {
                return res.status(500).json({ message: utils.ResponseUtil.responseErrorMessage(err) })
            })
        })

        this._router.post('/obter-valores-lancados/:id', (req, res) => {
            this._chequeModel.obterValorLancadoContas(_.get(req, 'params.id')).then((r) => {
                return res.json(r)
            }).catch((err) => {
                return res.status(500).json({ message: utils.ResponseUtil.responseErrorMessage(err) })
            })
        })

        this._router.post('/obter/:id', (req, res) => {
            this._chequeModel.findOne({id : _.get(req, 'params.id')}).then((r) => {
                return res.json(r)
            }).catch((err) => {
                return res.status(500).json({ message: utils.ResponseUtil.responseErrorMessage(err) })
            })
        })

        this._router.post('/save', (req, res) => {
            this._chequeModel.createOrUpdate(req.body).then((r) => {
                return res.json({ data: r, message: 'Cheque Salvo com sucesso!' })
            }).catch((err) => {
                return res.status(500).json({ message: utils.ResponseUtil.responseErrorMessage(err) })
            })
        })


        this._router.post('/save-historico', (req, res) => {
            this._historicoModel.saveHistorico(req.body).then((r) => {
                return res.json({ data: r, message: 'Agência Salva com sucesso!' })
            }).catch((err) => {
                return res.status(500).json({ message: utils.ResponseUtil.responseErrorMessage(err) })
            })
        })


        this._router.post('/list-historicos', (req, res) => {
            let {chequeId } = req.body

            if(!chequeId)
                return res.status(500).json({message: 'Parametro inválido para pesquisa de cheque!'})
                
            this._historicoModel.findAll({chequeId : chequeId}).then(r => {
                return res.json(r)
            }).catch(err => {
                return res.status(500).json({message: utils.ResponseUtil.responseErrorMessage(err)})
            })
        })


    }
}


module.exports = (app) => {
    return new ChequeController(app).router()
}