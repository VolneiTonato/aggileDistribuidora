const utils = require('../../../helpers/_utils/utils')
const aggileAdminModel = require('../../../models/aggile-admin/aggileAdminModel')

class GrupoController {

    constructor(app) {
        this._app = app

        this._router = require('express').Router()

        this._pathView = `${__dirname}/../views`

        this.registerRouters()

        this._grupoModel = new aggileAdminModel.GrupoModel()
    }

    router() {

        return this._router
    }

    registerRouters() {

        this._router.post('/list-grupos-pais', (req, res) => {
            this._grupoModel.findAllGruposPais().then((r) => {
                return res.json(r)
            }).catch((err) => {
                return res.status(500).json({ message: utils.ResponseUtil.responseErrorMessage(err) })
            })
        })

        this._router.post('/list', (req, res) => {
            this._grupoModel.pesquisar(req.body).then((r) => {
                return res.json(r)
            }).catch((err) => {
                return res.status(500).json({ message: utils.ResponseUtil.responseErrorMessage(err) })
            })
        })

        this._router.post('/save', (req, res) => {
            this._grupoModel.createOrUpdate(req.body).then((r) => {
                return res.json({ data: r, message: 'Grupo salvo com sucesso!' })
            }).catch((err) => {
                return res.status(500).json({ message: utils.ResponseUtil.responseErrorMessage(err) })
            })
        })

        this._router.post('/save-ecommerce', (req, res) => {
            this._grupoModel.saveToEcommece(req.body).then((r) => {
                return res.json({ data: { save: true }, message: 'Grupo salvo com sucesso!' })
            }).catch((err) => {
                return res.status(500).json({ message: utils.ResponseUtil.responseErrorMessage(err) })
            })

        })

        this._router.post('/clear-ecommerce', (req, res) => {
            this._grupoModel.clearToEcommece(req.body).then((r) => {
                return res.json({ data: { save: true }, message: 'Grupo salvo com sucesso!' })
            }).catch((err) => {
                return res.status(500).json({ message: utils.ResponseUtil.responseErrorMessage(err) })
            })
        })


    }

}


module.exports = (app) => {
    return new GrupoController(app).router()
}