const aggileAdminModel = require('../../../models/aggile-admin/aggileAdminModel')
const enums = require('../../../models/aggile-admin/includes/enuns/enum')
const utils = require('../../../helpers/_utils/utils')

const response = (res, promise) => {
    return new Promise((resolve, reject) => {
        promise.then((r) => {
            return resolve(res.json(r))
        }).catch((err) => {
            return resolve(res.status(500).json({ message: utils.ResponseUtil.responseErrorMessage(err) }))
        })
    })
}

class SincronizacaoController {

    constructor(app) {
        this._app = app

        this._router = require('express').Router()

        this.registerRouters()


    }

    router() {
        return this._router
    }



    registerRouters() {

        //this._router.post('/listar-clientes', (req, res) => { response(res, new aggileAdminModel.ClienteModel().findAll()) })

        //this._router.post('/listar-produtos', (req, res) => { response(res, new aggileAdminModel.ProdutoModel().findAll()) })

        //this._router.post('/listar-fabricas', (req, res) => { response(res, new aggileAdminModel.FabricaModel().findDataIndexDB() )}) 

        this._router.post('/listar-estados', (req, res) => { response(res, new aggileAdminModel.EstadoModel()._model.findAll()) })

        this._router.post('/listar-municipios', (req, res) => { response(res, new aggileAdminModel.MunicipioModel()._model.findAll()) })

        //this._router.post('/listar-entradas', (req, res) => { response(res, new aggileAdminModel.NotaEntradaModel().findAll()) })

        //this._router.post('/listar-entradas-produtos', (req, res) => { response(res, new aggileAdminModel.ItemNotaEntradaModel().findAll()) })

        //this._router.post('/listar-receitas', (req, res) => { response(res, new aggileAdminModel.RecebimentoModel().findAll()) })

        //this._router.post('/listar-receitas-historicos', (req, res) => { response(res, new aggileAdminModel.HistoricoRecebimentoModel().findAll()) })

        this._router.post('/listar-grupos', (req, res) => { response(res, new aggileAdminModel.GrupoModel().findAll()) })

        //this._router.post('/listar-pedidos', (req, res) => { response(res, new aggileAdminModel.PedidoClienteModel().findAll()) })

        //this._router.post('/listar-pedidos-produtos', (req, res) => { response(res, new aggileAdminModel.ItemPedidoClienteModel().findAll()) })

        this._router.post('/listar-volumes', (req, res) => { response(res, new aggileAdminModel.VolumeModel()._model.findAll()) })

        this._router.post('/listar-bancos', (req, res) => { response(res, new aggileAdminModel.BancoModel()._model.findAll() )})

        this._router.post('/listar-tipo-unidade', (req, res) => { response(res, new aggileAdminModel.TipoUnidadeModel()._model.findAll()) })

        this._router.post('/listar-motivo-devolucao-cheque', (req, res) => { response(res, new aggileAdminModel.MotivoDevolucaoChequeModel()._model.findAll()) })

        this._router.post('/listar-tipos-estabelecimentos-enum', (req, res) => { return res.json(new aggileAdminModel.ClienteModel().tiposEstabelecimento()) })

        this._router.post('/listar-status-recebimentos-enum', (req, res) => { return res.json(enums.EnumStatusRecebimento) })

        this._router.post('/listar-status-despesas-enum', (req, res) => { return res.json(enums.EnumStatusDespesa) })

        this._router.post('/listar-operacao-inventario-enum', (req, res) => { return res.json(enums.EnumOperacaoInventario) })

        this._router.post('/listar-status-pedido-enum', (req, res) => { return res.json(enums.EnumStatusPedido) })

        this._router.post('/listar-status-pedido-fabrica-enum', (req, res) => { return res.json(enums.EnumStatusPedidoFabrica) })

        this._router.post('/listar-status-nota-fiscal-enum', (req, res) => { return res.json(enums.EnumStatusNotaFiscal) })

        this._router.post('/listar-formas-pagamento-enum', (req, res) => { return res.json(enums.EnumFormaPagamento) })

        this._router.post('/listar-status-cheque-enum', (req, res) => { return res.json(enums.EnumStatusCheque) })

        this._router.post('/listar-origem-lancamento-cheque-enum', (req, res) => { return res.json(enums.enumOrigemLancamentoCheque) })

        


        this._router.post('/save-local-to-server', (req, res) => {

            res.tables.forEach( (table) => {
                if(table == 'cliente'){
                    
                }
            })
        })


    }

}


module.exports = (app) => {
    return new SincronizacaoController(app).router()
}