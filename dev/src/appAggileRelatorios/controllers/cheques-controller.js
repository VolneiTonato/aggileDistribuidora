const utils = require('../../../helpers/_utils/utils')
const modelReport = require('../models/model')
const pathView = `${__dirname}/../views`
const _ = require('lodash')

const reports = [
    { name: 'cheques', templateId: '#template-report-cheques-movimentacao-contas', href: '/reports/cheques/report-cheques-movimentacao-contas', titulo: 'Histórico Movimentação Contas Cheque' },
]

class ChequeController {

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
            res.render(`${this._pathView}/cheques/index.pug`, { reports: reports })
        })


        this._router.post('/report-cheque-movimentacao-contas/:chequeId', async (req, res) => {

            let filtro = req.body.report

            let data = await new modelReport.ChequeReportModel().chequeByMovimentacaoContas({ chequeId: req.params.chequeId })


            let view = `${this._pathView}/cheques/reports/cheque-movimentacao-contas.pug`

            const options = {
                title: `Relatório de Movimentação de Contas / Cheques`,
                dataHora: utils.DateUtil.getStringDateAndTime(),
                result: data,
                filtro: filtro
            }

            let promise = null
 
            let generateReport = new utils.ChromePDF()

            if (filtro.typeFormatReport == 'html')
                promise = generateReport.generateFileHTMLAndGetKeyPugTemplate(`${view}`, options)
            else
                promise = generateReport.generateFileAndGetKeyPugTemplate(`${view}`, options)



            promise.then(key => {
                return res.json({ key: key })
            }).catch(err => {
                return res.status(400).send({ message: err.toString() })
            })

            
        })
    }

}

module.exports = (app) => {
    return new ChequeController(app).router()
}