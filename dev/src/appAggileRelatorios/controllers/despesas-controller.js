const utils = require('../../../helpers/_utils/utils')
const modelReport = require('../models/model')
const aggileModel = require('../../../models/aggile-admin/aggileAdminModel')
const pathView = `${__dirname}/../views`
const _ = require('lodash')

const reports = [
    { name: 'contas-a-pagar', templateId: '#template-report-despesas-contas-a-pagar', href: '/reports/despesas/report-pagamentos', titulo: 'Pagamentos' }
]

class DespesasController {

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
            res.render(`${this._pathView}/despesas/index.pug`, { reports: reports })
        })


        this._router.post('/report-pagamentos', async (req, res) => {

            let filtro = req.body.report

            let despesas = await new modelReport.DespesaReportModel().pagamentos(_.clone(filtro))

            let view = `${this._pathView}/despesas/reports/pagamentos/pagamento-geral.pug`

            let totalizador = {}

            if (filtro.typeReport == 'resumido') {

                view = `${this._pathView}/despesas/reports/pagamentos/pagamento-geral-resumido.pug`


                let data = _.chain(despesas)
                    .groupBy('pessoa.id')
                    .toPairs()
                    .map((item) => { return _.zipObject(['pessoaId', 'despesas'], item) })
                    .each((item) => { item.pessoa = (_.head(item.despesas) || {}).pessoa })
                    .each((item) => { item.despesas = _.orderBy(item.despesas, ['status'], ['asc']) })
                    .each((item) => {



                        item.totalizador = {
                            totalFatura: _.sumBy(item.receitas, (o) => { return ['cancelada'].indexOf(o.status) === -1 ? o.valor : 0 }),
                            totalSaldo: _.sumBy(item.receitas, (o) => { return ['cancelada', 'paga'].indexOf(o.status) === -1 ? o.saldo : 0 })
                        }
                        item.totalizador.totalPago = utils.NumberUtil.diminuir(item.totalizador.totalFatura, item.totalizador.totalSaldo)

                        if (filtro.visualizacaoFaturaReport == 'resumirFatura') {

                            view = `${this._pathView}/despesas/reports/pagamentos/pagamento-geral-resumido-sem-fatura.pug`

                            item.despesas.map((element, key) => {
                                item.despesas[key].valorPago = _.sumBy(element.historicos, 'valorPago')    

                                element.historicos = []
                            })
                        }


                    }).each((item) => {
                        totalizador.totalGeralFatura = utils.NumberUtil.sum(totalizador.totalGeralFatura, item.totalizador.totalFatura)
                        totalizador.totalGeralPagamento = utils.NumberUtil.sum(totalizador.totalGeralPagamento, item.totalizador.totalPago)
                        totalizador.totalGeralSaldo = utils.NumberUtil.sum(totalizador.totalGeralSaldo, item.totalizador.totalSaldo)
                    })
                    .value()



                despesas = data

            }

            let key = null

            const options = {
                title: `Relatório de Contas a Pagar ${filtro.typeReport}`,
                dataHora: utils.DateUtil.getStringDateAndTime(),
                result: despesas,
                filtro: filtro,
                data: totalizador
            }

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

    return new DespesasController(app).router()
}