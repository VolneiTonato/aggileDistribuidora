const utils = require('../../../helpers/_utils/utils')
const aggileAdminModel = require('../../../models/aggile-admin/aggileAdminModel')
const middleware = require('../../../midleware/middleware')

class PedidoFabricaController {

    constructor(app) {
        this._app = app

        this._router = require('express').Router()

        this._pathView = `${__dirname}/../views`

        this._pedidoFabricaModel = new aggileAdminModel.PedidoFabricaModel()

        this._itemPedidoFabricaModel = new aggileAdminModel.ItemPedidoFabricaModel()



        this.registerRouters()
    }

    router(){

        return this._router
    }

    registerRouters(){
        
        this._router.post('/save', (req, res, next) => {

            let pedido = req.body

            pedido.usuarioId = req.user.id

       

            this._pedidoFabricaModel.createOrUpdate(pedido).then( (r) => {
                return res.json({data : r, message: 'Pedido Salvo com sucesso!'})
            }).catch( (err) => {
                return res.status(500).json({message : utils.ResponseUtil.responseErrorMessage(err)})
            })
        })

      

        this._router.post('/cancelar-pedido', (req, res, next) => {
            
            this._pedidoFabricaModel.cancelarPedido(req.body).then( (r) => {
                
                return res.json({data : {lancamento: true}, message: `Pedido Nº ${req.body.id} ${req.body.isEstorno == 'true' ? 'estornado' : 'cancelado'}!`})
                    
            }).catch( (err) => {
                return res.status(500).json({message : utils.ResponseUtil.responseErrorMessage(err)})
            })
        })

        this._router.post('/listar-pedidos', middleware.MiddlewareQuerySearch
            , (req, res, next) => {

            this._pedidoFabricaModel.pesquisar(req.body).then( (r) => {
                return res.json(r)
            }).catch( (err) => {
                return res.status(500).json({message : utils.ResponseUtil.responseErrorMessage(err)})
            })
        })

        this._router.post('/save-item', (req, res, next) => {
            
            this._itemPedidoFabricaModel.saveItemPedido(req.body).then( (r) => {
                return res.json(r)
            }).catch( (err) => {
                return res.status(500).json({message : utils.ResponseUtil.responseErrorMessage(err)})
            })
        })

        this._router.post('/remove-item', (req, res, next) => {
            this._itemPedidoFabricaModel.removeItemPedido(req.body).then( (r) => {
                return res.json({data : true})
            }).catch( (err) => {
                return res.status(500).json({message: utils.ResponseUtil.responseErrorMessage(err)})
            })
        })

        
       
    }

}


module.exports = (app) => {
    return new PedidoFabricaController(app).router()
}