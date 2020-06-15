const utils = require('../../../helpers/_utils/utils')
const aggileAdminModel = require('../../../models/aggile-admin/aggileAdminModel')
const middleware = require('../../../midleware/middleware')

class PedidoClienteController {

    constructor(app) {
        this._app = app

        this._router = require('express').Router()

        this._pathView = `${__dirname}/../views`

        this._pedidoClienteModel = new aggileAdminModel.PedidoClienteModel()

        this._pedidoClienteModel = new aggileAdminModel.PedidoClienteModel()

        this._itemPedidoClienteModel = new aggileAdminModel.ItemPedidoClienteModel()



        this.registerRouters()
    }

    router(){

        return this._router
    }

    registerRouters(){
        
        this._router.post('/save', (req, res, next) => {

            let pedido = req.body


            pedido.usuarioId = req.user.id


            this._pedidoClienteModel.createOrUpdate(pedido).then( (r) => {
                return res.json({data : r, message: 'Pedido Salvo com sucesso!'})
            }).catch( (err) => {
                return res.status(500).json({message : utils.ResponseUtil.responseErrorMessage(err)})
            })
        })

      

        this._router.post('/cancelar-pedido', (req, res, next) => {
            
            this._pedidoClienteModel.cancelarPedido(req.body).then( (r) => {
                
                return res.json({data : {lancamento: true}, message: `Pedido Nº ${req.body.id} ${req.body.isEstorno == 'true' ? 'estornado' : 'cancelado'}!`})
                    
            }).catch( (err) => {
                return res.status(500).json({message : utils.ResponseUtil.responseErrorMessage(err)})
            })
        })

        this._router.post('/listar-pedidos', middleware.MiddlewareQuerySearch
            , (req, res, next) => {

            this._pedidoClienteModel.pesquisar(req.body).then( (r) => {
                return res.json(r)
            }).catch( (err) => {
                return res.status(500).json({message : utils.ResponseUtil.responseErrorMessage(err)})
            })
        })

        this._router.post('/save-item', (req, res, next) => {
            
            this._itemPedidoClienteModel.saveItemPedido(req.body).then( (r) => {
                return res.json(r)
            }).catch( (err) => {
                return res.status(500).json({message : utils.ResponseUtil.responseErrorMessage(err)})
            })
        })

        this._router.post('/remove-item', (req, res, next) => {
            this._itemPedidoClienteModel.removeItemPedido(req.body).then( (r) => {
                return res.json({data : true})
            }).catch( (err) => {
                return res.status(500).json({message: utils.ResponseUtil.responseErrorMessage(err)})
            })
        })

        
       
    }

}


module.exports = (app) => {
    return new PedidoClienteController(app).router()
}