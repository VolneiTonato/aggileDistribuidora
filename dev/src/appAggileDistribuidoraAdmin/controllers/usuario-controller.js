const utils = require('../../../helpers/_utils/utils')
const aggileAdminModel = require('../../../models/aggile-admin/aggileAdminModel')

class UsuarioController {

    constructor(app) {
        this._app = app

        this._router = require('express').Router()

        this._pathView = `${__dirname}/../views`

        this.registerRouters()

        this._usuarioModel = new aggileAdminModel.UsuarioModel()
    }

    router(){

        return this._router
    }

    registerRouters(){

        this._router.get('/list', async (req, res) => {

            let [err, ok] = await utils.PromiseUtil.to(this._usuarioModel.findAll(req.body))

            if(err)
                return res.status(500).json({message : utils.ResponseUtil.responseErrorMessage(err)})
            return res.json(ok)

        })

        this._router.post('/save', (req, res) => {
            this._usuarioModel.createOrUpdate(req.body).then( (r) => {
                return res.json({data: r, message : 'Usuário salvo com sucesso!'})
            }).catch( (err) => {
                return res.status(500).json({message : utils.ResponseUtil.responseErrorMessage(err)})
            })            
        })
       
    }

}


module.exports = (app) => {
    return new UsuarioController(app).router()
}