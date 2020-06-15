
const url = '/api/'
const midleware = require('../../../midleware/middleware')

module.exports = (app) => {

    app.use((req, res, next) => {
        let url = req.originalUrl
        

        if (!/^(\/api\/)/.test(url))
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

    app.use(`${url}estado-municipio/`, require('../controllers/estado-municipio-controller')(app)),
        app.use(`${url}complementos-produto/`, require('../controllers/complemento-produtos-controller')(app)),
        app.use(`${url}usuario/`, require('../controllers/usuario-controller')(app)),
        app.use(`${url}movimentacao/`, require('../controllers/movimentacao-controller')(app)),
        app.use(`${url}enumeradores/`, require('../controllers/enum-controller')(app)),
        app.use(`${url}pessoas/`, require('../controllers/pessoa-controller')(app)),
        app.use(`${url}sincronizacao/`, require('../controllers/sincronizacao-controller')(app))


}