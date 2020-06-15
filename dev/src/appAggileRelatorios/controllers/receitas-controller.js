const utils = require('../../../helpers/_utils/utils')
const modelReport = require('../models/model')
const pathView = `${__dirname}/../views`
const _ = require('lodash')

const reports = [
    { name: 'contas-a-receber', templateId: '#template-report-receitas-contas-a-receber', href: '/reports/receitas/report-recebimentos', titulo: 'Recebimentos' }
]

class ReceitasController {

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
            res.render(`${this._pathView}/receitas/index.pug`, { reports: reports })
        })


        this._router.post('/report-recebimentos', async (req, res) => {

            let filtro = req.body.report

            let receitas = await new modelReport.ReceitaReportModel().recebimentos(_.clone(filtro))

            let view = `${this._pathView}/receitas/reports/recebimentos/recebimento-geral.pug`

            let totalizador = {}

            if (filtro.typeReport == 'resumido') {

                view = `${this._pathView}/receitas/reports/recebimentos/recebimento-geral-resumido.pug`

                let data = _.chain(receitas)
                    .groupBy('pessoa.id')
                    .toPairs()
                    .map((item) => { return _.zipObject(['pessoaId', 'receitas'], item) })
                    .each((item) => { item.pessoa = (_.head(item.receitas) || {}).pessoa })
                    .each((item) => { item.receitas = _.orderBy(item.receitas, ['status'], ['asc']) })
                    .each((item) => {



                        item.totalizador = {
                            totalFatura: _.sumBy(item.receitas, (o) => { return ['cancelada'].indexOf(o.status) === -1 ? o.valor : 0 }),
                            totalSaldo: _.sumBy(item.receitas, (o) => { return ['cancelada', 'paga'].indexOf(o.status) === -1 ? o.saldo : 0 })
                        }
                        item.totalizador.totalPago = utils.NumberUtil.diminuir(item.totalizador.totalFatura, item.totalizador.totalSaldo)

                        if (filtro.visualizacaoFaturaReport == 'resumirFatura') {
                            view = `${this._pathView}/receitas/reports/recebimentos/recebimento-geral-resumido-sem-fatura.pug`

                            item.receitas.map((element, key) => {
                                item.receitas[key].valorPago = _.sumBy(element.historicos, 'valorPago')
                                element.historicos = []
                            })

                        }



                    }).each((item) => {
                        totalizador.totalGeralFatura = utils.NumberUtil.sum(totalizador.totalGeralFatura, item.totalizador.totalFatura)
                        totalizador.totalGeralPagamento = utils.NumberUtil.sum(totalizador.totalGeralPagamento, item.totalizador.totalPago)
                        totalizador.totalGeralSaldo = utils.NumberUtil.sum(totalizador.totalGeralSaldo, item.totalizador.totalSaldo)
                    })
                    .value()



                receitas = data

            }

            let options = {
                title: `Relatório de Contas a Receber ${filtro.typeReport}`,
                dataHora: utils.DateUtil.getStringDateAndTime(),
                result: receitas,
                data: totalizador,
                filtro: filtro
            }

            let key = null

            let generateReport = new utils.ChromePDF()


            if (_.get(filtro, 'typeFormatReport') == 'html')
                key = await generateReport.generateFileHTMLAndGetKeyPugTemplate(`${view}`, options)
            else
                key = await generateReport.generateFileAndGetKeyPugTemplate(`${view}`, options)



            return res.json({ key: key })
        })


    }

}

module.exports = (app) => {

    return new ReceitasController(app).router()
}