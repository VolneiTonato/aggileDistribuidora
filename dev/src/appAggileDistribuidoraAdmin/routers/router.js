const utils = require('../../../helpers/_utils/utils')
const middleare = require('../../../midleware/middleware')

const url = '/admin/'


module.exports = (app, passport) => {

    
    require('../controllers/includes/passport-config')(app, passport),

    app.use(`${url}auth/`, require('../controllers/auth-controller')(app)),


    app.use((req, res, next) => {
        let url = req.originalUrl

        if(!/^(\/admin\/)/.test(url))
            return next()
       
        
        let isAuth = req.isAuthenticated()
        let isAjax = req.xhr


        if (!isAuth) {


            if (isAjax)
                return res.status(500).json({ logado: false })
            else
                return res.redirect('/admin/auth')
        }


        return next()
       
    })

    app.use((req, res, next) => {
        if(req.user)
            req.body.usuarioLogado = utils.ObjectUtil.getValueProperty(req, 'user.dataValues')

        next()
    })





    app.use(`${url}`, require('../controllers/home-controller')(app)),
    app.use(`${url}fabricas/`, require('../controllers/fabrica-controller')(app)),
    app.use(`${url}clientes/`, require('../controllers/cliente-controller')(app)),
    app.use(`${url}cedentes/`, require('../controllers/cedente-controller')(app)),
    app.use(`${url}volumes/`, require('../controllers/volume-controller')(app)),
    app.use(`${url}usuarios/`, require('../controllers/usuario-controller')(app)),
    app.use(`${url}tipos-unidades/`, require('../controllers/tipo-unidade-controller')(app)),
    app.use(`${url}grupos/`, require('../controllers/grupo-controller')(app)),
    app.use(`${url}produtos/`, require('../controllers/produto-controller')(app)),
    app.use(`${url}notas-entrada/`, require('../controllers/entrada-controller')(app)),
    app.use(`${url}pedidos-cliente/`, require('../controllers/pedido-cliente-controller')(app)),
    app.use(`${url}pedidos-fabrica/`, require('../controllers/pedido-fabrica-controller')(app)),
    app.use(`${url}financeiro/contas-a-receber/`, require('../controllers/recebimento-controller')(app)),
    app.use(`${url}financeiro/contas-a-pagar/`, require('../controllers/despesa-controller')(app)),
    app.use(`${url}inventario/`, require('../controllers/inventario-controller')(app)),
    app.use(`${url}vendedores/`, require('../controllers/vendedor-controller')(app)),
    app.use(`${url}enderecos/`, require('../controllers/endereco-controller')(app)),
    app.use(`${url}financeiro/`, require('../controllers/financeiro/financeiro-controller')(app))
    app.use(`${url}importacao/`, require('../controllers/importacao-controller')(app))


}