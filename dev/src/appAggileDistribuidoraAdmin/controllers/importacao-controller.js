const utils = require('../../../helpers/_utils/utils')
const googleService = require('../../../services/googleApi/googleApiService')
const aggileModel = require('../../../models/aggile-admin/aggileAdminModel')
const request = require('request')
const _ = require('lodash')
const circularJsonEs6 = require('circular-json-es6')

class ImportacaoController {

    constructor(app) {
        this._app = app

        this._router = require('express').Router()



        this.registerRouters()


    }

    router() {
        return this._router
    }

    registerRouters() {

        this._router.get('/importar-produtos-google', (req, res) => {

            googleService.ProdutoAggileDistribuidoraService.importarProdutosToFileJson().then(() => {
                console.log('importação concluída')
            }).catch((err) => {
                console.log(err)
            })

            return res.send('true')
        })

        this._router.post('/sincronizacao-to-ecommerce-grupos', async (req, res) => {

            try {

                let isResponse = false


                let grupos =await new aggileModel.GrupoEcommerceModel().findAllToEcommerce() || []


                grupos = utils.JsonUtil.toReParse(grupos)

                
                request({
                    uri: 'http://site_destilados_da_serra:5000/api/integracao/sistema-aggile/grupos/import-grupos',
                    method: 'POST',
                    form: { grupos: grupos },
                    auth: {
                        user: 'administrador',
                        pass: '091186',
                        sendImmediately: false

                    }
                }, (err, response = {}, body = {}) => {
                    if (response.statusCode === 500) {
                        isResponse = true
                        return res.status(500).send({ message: body })
                    }
                })

                setTimeout(() => {
                    if(!isResponse)
                        return res.send(true)
                }, 5000)
            } catch (err) {
                return res.status(500).send({ message: err.toString() })
            }

        })


        this._router.post('/sincronizacao-to-ecommerce-produtos', async (req, res) => {


            try {

                
                let produtos = await new aggileModel.ProdutoEcommerceModel().findAllToEcommerce({ isEcommerce: true })

                

                let isResponse = false

                request({
                    uri: 'http://site_destilados_da_serra:5000/api/integracao/sistema-aggile/produtos/import-produtos',
                    method: 'POST',
                    form: { produtos: produtos.length > 0 ? JSON.parse(JSON.stringify(produtos)) : [] },
                    auth: {
                        user: 'administrador',
                        pass: '091186',
                        sendImmediately: false

                    },
                }, (err, response = {}, body) => {
                    if (response.statusCode === 500) {
                        isResponse = true
                        return res.status(500).send({ message: body })
                    }
                })

                setTimeout(() => {
                    if(!isResponse)
                        return res.send(true)
                }, 5000)

            } catch (err) {
                console.log(err)
                return res.status(500).send({ message: err })
            }

        })


    }

}


module.exports = (app) => {
    return new ImportacaoController(app).router()
}