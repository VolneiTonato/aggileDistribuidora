const utils = require('../../../helpers/_utils/utils')
const modelReport = require('../models/model')
const pathView = `${__dirname}/../views`
const _ = require('lodash')

const reports = [
    { name: 'compras', templateId: '#template-report-compras', href: '/reports/compras/report-compras-geral', titulo: 'Compras' },
]

class CompraController {

    constructor(app) {
        this._app = app

        this._router = require('express').Router()

        this._pathView = pathView

        this.registerRouters()
    }

    router() {
        return this._router
    }

    registerRouters() {

        this._router.get('/', (req, res) => {
            res.render(`${this._pathView}/compras/index.pug`, { reports: reports })
        })


        this._router.post('/report-compras-geral', async (req, res) => {

            let filtro = req.body.report

            let compras = await new modelReport.CompraReportModel().comprasGeral(_.clone(filtro))


            let view = `${this._pathView}/compras/reports/compras/compra-geral.pug`

            const options = {
                title: 'Relatório de Compras',
                dataHora: utils.DateUtil.getStringDateAndTime(),
                result: compras,
                filtro : filtro
            }

            let key = null

            let generateReport = new utils.ChromePDF()


            if(_.get(filtro, 'typeFormatReport') == 'html')
                key = await generateReport.generateFileHTMLAndGetKeyPugTemplate(`${view}`,options)
            else
                key = await generateReport.generateFileAndGetKeyPugTemplate(`${view}`,options)


            return res.json({ key: key })
        })
    }

}

module.exports = (app) => {
    return new CompraController(app).router()
}