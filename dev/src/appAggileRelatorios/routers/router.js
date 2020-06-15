
const url = '/reports/'
const utils = require('../../../helpers/_utils/utils')
const _ = require('lodash')

module.exports = (app) => {

    app.use((req, res, next) => {

        let uri = req.originalUrl

        if (/(report-view-anonymous)/ig.test(uri))
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

    }, (req, res, next) => {

        //itens obrigatorios
        // sizeFonte, typeFormatReport, typeOrientacaoReport
        if (_.get(req, 'body.report')) {

            if (['pdf', 'html'].indexOf(req.body.report.typeFormatReport) === -1)
                req.body.report['typeFormatReport'] = 'pdf'

            if (['retrato', 'paisagem'].indexOf(req.body.report.typeOrientacaoReport) === -1)
                req.body.report.typeOrientacaoReport = `retrato`

            let sizeFonte = req.body.report.sizeFonte || 15

            if (sizeFonte < 10 || sizeFonte > 30)
                return res.status(400).json({ message: `O tamanho da fonte deve ser definido para gerar  o report.` })

            req.body.report.optionsReplaceHTML = { '__FONTE_SIZE__': `${sizeFonte}px` }


        } else {

            req.query.report = {
                typeFormatReport: req.query.type || 'pdf',
                typeOrientacaoReport: req.query.orientacao || 'paisagem',
                optionsReplaceHTML: { '__FONTE_SIZE__': `${utils.NumberUtil.cInt(req.query.sizefonte) || 18}px` }
            }
        }

        next()
    })


    app.get(`${url}generate-report-iframe/:key`, async (req, res) => {
        try {


            let html = await new utils.ChromePDF().getHTMLToKey(req.params.key)

            res.contentType('text/html').send(html)

        } catch (err) {
            return res.send(utils.ResponseUtil.responseErrorMessage(err))
        }

    })


    app.get(`${url}generate-report/:key`, async (req, res) => {


        let { type } = req.query


        try {

            if (type == 'html') {

                let html = await new utils.ChromePDF().getHTMLToKey(req.params.key)

                res.contentType('text/html').send(html)


            } else if (type == 'pdf') {

                let pdf = await new utils.ChromePDF().getPdfToKey(req.params.key)

                res.contentType('application/pdf').send(pdf)

            } else {
                return res.send('Árquivo inválido!')
            }



        } catch (err) {
            return res.send(utils.ResponseUtil.responseErrorMessage(err))
        }



    })


    app.use(`${url}`, require('../controllers/home-controller')(app)),
        app.use(`${url}produtos/`, require('../controllers/produtos-controller')(app)),
        app.use(`${url}pedidos/`, require('../controllers/pedidos-controller')(app)),
        app.use(`${url}receitas/`, require('../controllers/receitas-controller')(app)),
        app.use(`${url}despesas/`, require('../controllers/despesas-controller')(app)),
        app.use(`${url}planilhas/`, require('../controllers/planilhas-controller')(app)),
        app.use(`${url}clientes/`, require('../controllers/clientes-controller')(app)),
        app.use(`${url}compras/`, require('../controllers/compras-controller')(app)),
        app.use(`${url}pedidos-fabrica/`, require('../controllers/pedidos-fabrica-controller')(app)),
        app.use(`${url}cheques/`, require('../controllers/cheques-controller')(app))


}