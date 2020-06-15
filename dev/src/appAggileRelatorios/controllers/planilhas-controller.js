const utils = require('../../../helpers/_utils/utils')
const modelReport = require('../models/model')
const aggileModel = require('../../../models/aggile-admin/aggileAdminModel')
const pathView = `${__dirname}/../views`
const _ = require('lodash')
const serviceGoogle = require('../../../services/googleApi/googleApiService')

const reports = [
    { name: 'contas-a-pagar', templateId: '#template-report-planilha-precos', href: '/reports/planilhas/report-tabelas-precos', titulo: 'Preços' }
]

class PlanilhaController {

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
            res.render(`${this._pathView}/planilhas/index.pug`, { reports: reports })
        })

        this._router.post('/report-tabelas-precos', async (req, res) => {
            let filtro = req.body.report

            serviceGoogle.PlanilhaToPDFService.listar(filtro.id, filtro.range).then(async (produtos) => {

                let data = _.chain(produtos)
                            .filter((item) => { return item.Mostrar == 'TRUE' })
                            .groupBy('Grupo')
                            .toPairs()
                            .map( (item) => { return _.zipObject(['grupo', 'produtos'], item) })
                            .value()

                
                let generateReport = new utils.ChromePDF()
                

                let key = generateReport.generateFileAndGetKeyPugTemplate(`${this._pathView}/planilhas/reports/precos-vendedores.pug`, {
                    title: 'Relatório de Preços',
                    dataHora: utils.DateUtil.getStringDateAndTime(),
                    rows: data,
                    data: filtro
                })

                return res.json({ key: key })

            }).catch((err) => {
                return utils.ResponseUtil.responseErrorMessage(err)
            })
        })





    }

}

module.exports = (app) => {

    return new PlanilhaController(app).router()
}