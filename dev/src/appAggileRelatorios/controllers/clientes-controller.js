const utils = require('../../../helpers/_utils/utils')
const modelReport = require('../models/model')
const _ = require('lodash')

const reports = [
    { name: 'cliente', templateId: '#template-report-cliente-geral', href: '/reports/clientes/report-geral', titulo: 'Clientes' }
]

class ClienteController {

    constructor(app) {
        this._app = app

        this._router = require('express').Router()

        this._pathView = `${__dirname}/../views`

        this.registerRouters()
    }

    router() {
        return this._router
    }

    registerRouters() {

        this._router.get('/', (req, res) => {
            res.render(`${this._pathView}/clientes/index.pug`, { reports: reports })
        })

        this._router.post('/report-geral', async (req, res) => {

            let filtro = req.body.report


            let clientes = await new modelReport.ClienteReportModel().clienteGeral(_.clone(filtro))

            let data = _.chain(clientes)
                .groupBy('endereco.municipio.id')
                .toPairs()
                .map((item) => { return _.zipObject(['municipioId', 'data'], item) })
                .each((item) => { item.municipio = utils.ObjectUtil.getValueProperty(_.head(item.data), 'endereco.municipio') })
                .value()

            utils.ObjectUtil.deleteProperty(data, 'municipioId')

            data.map(clienteGropuByBairro => {
                let results = _.chain(clienteGropuByBairro.data)
                    .groupBy('endereco.bairro')
                    .toPairs()
                    .map(item => { return _.zipObject(['bairro', 'data'], item) })
                    .value()

                clienteGropuByBairro.data = results
            })

            const view = `${this._pathView}/clientes/reports/cliente-geral.pug`

            const options = {
                title: 'Relatório de Clientes Geral',
                dataHora: utils.DateUtil.getStringDateAndTime(),
                result: data,
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
    return new ClienteController(app).router()
}