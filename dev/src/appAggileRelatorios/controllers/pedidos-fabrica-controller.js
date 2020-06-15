const utils = require('../../../helpers/_utils/utils')
const modelReport = require('../models/model')
const aggileModel = require('../../../models/aggile-admin/aggileAdminModel')
const pathView = `${__dirname}/../views`
const _ = require('lodash')

const reports = [
    { name: 'pedidoFabrica', templateId: '#template-report-pedido-fabrica-geral', href: '/reports/pedidos-fabrica/report-fabrica-geral', titulo: 'Pedidos' }
]

const reportFabrica = async (req, res) => {

    let pedido = await new aggileModel.PedidoFabricaModel().findOne({ uuid: req.params.uuid })

    if (!pedido)
        return res.json({ message: 'Pedido invalido!' })

    let filtro = req.query.report



    let dataInicial = utils.DateUtil.getMoment(pedido.dataEntrega)
    let dataAtual = utils.DateUtil.getMoment(new Date())

    if (/(report-view-anonymous)/ig.test(req.originalUrl)) {
        let diff = Math.abs(parseInt(utils.DateUtil.getInstanceMoment().duration(dataInicial.diff(dataAtual)).asDays()))

        if (isNaN(diff))
            diff = 31

        if (diff > 30)
            return res.json({ message: 'O pedido não pode ser mais consultado!' })
    }

    let key = null

    let generateReport = new utils.ChromePDF()

    const options = {
        title: `Relatório de Pedidos`,
        dataHora: utils.DateUtil.getStringDateAndTime(),
        result: [pedido],
        filtro: filtro
    }

    let view = `${pathView}/pedidos-fabrica/reports/pedidos/pedido-fabrica-geral.pug`


    if (filtro.typeFormatReport == 'html') {
        key = await generateReport.generateFileHTMLAndGetKeyPugTemplate(`${view}`, options)

        res.contentType('text/html').send(await generateReport.getHTMLToKey(key))

    } else {
        key = await generateReport.generateFileAndGetKeyPugTemplate(`${view}`, options)

        res.contentType('application/pdf').send(await generateReport.getPdfToKey(key))
    }
}


class PedidoFabricaController {

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
            res.render(`${this._pathView}/pedidos-fabrica/index.pug`, { reports: reports })
        })

        this._router.get('/fabrica-report-view-anonymous/:uuid', reportFabrica)

        this._router.get('/report-fabrica/:uuid', reportFabrica)


        this._router.post('/report-fabrica-geral', async (req, res) => {

            let filtro = req.body.report

            filtro.isConferenciaTransportadora = utils.StringUtil.stringToBool(filtro.isConferenciaTransportadora)

            let pedidos = await new modelReport.PedidoFabricaReportModel().pedidosFabricaGeral(_.clone(filtro))


            let view = `${this._pathView}/pedidos-fabrica/reports/pedidos/pedido-fabrica-geral.pug`

            let totalizador = {}




            if (filtro.typeReport == 'resumido') {
                view = `${this._pathView}/pedidos-fabrica/reports/pedidos/pedido-geral-resumido.pug`

                let data = _.chain(pedidos)
                    .groupBy('pedidoFabrica.id')
                    .toPairs()
                    .map((item) => { return _.zipObject(['fabricaId', 'pedidos'], item) })
                    .each((item) => { item.pedidoFabrica = (_.head(item.pedidos) || {}).pedidoFabrica })
                    .each((item) => { item.pedidos = _.orderBy(item.pedidos, ['status'], ['asc']) })
                    .each((item) => {

                        item.totalizador = {
                            totalPedido: _.sum(_.map(item.pedidos, x => { return utils.NumberUtil.cdbl(x.total) })),
                            totalItens: _.sumBy(item.pedidos, 'totalItens'),
                            totalPeso: _.sum(_.map(item.pedidos, x => { return utils.NumberUtil.cdbl(x.pesoTotal) }))
                        }

                        totalizador.totalGeralPedido = utils.NumberUtil.sum(totalizador.totalGeralPedido, item.totalizador.totalPedido)
                        totalizador.totalGeralItens = utils.NumberUtil.sum(totalizador.totalGeralItens, item.totalizador.totalItens)
                        totalizador.totalGeralPeso = utils.NumberUtil.sum(totalizador.totalGeralPeso, item.totalizador.totalPeso)

                        if (filtro.visualizacaoPedidoReport == 'resumirPedido') {
                            view = `${this._pathView}/pedidos-fabrica/reports/pedidos/pedido-geral-resumido-sem-produtos.pug`

                            item.pedidos.map(element => {
                                element.itens = []
                            })
                        }

                    })

                    .each((item) => {
                        item.pedidos.forEach((pedido) => {
                            if (pedido.itens)
                                pedido.itens = _.orderBy(pedido.itens, ['isBonificado', 'produto.descricao'], ['asc', 'asc'])
                        })
                    })

                    .value()

                pedidos = data
            } else {
                if (pedidos.length > 0) {
                    pedidos.forEach(pedido => {
                        pedido.itens = _.orderBy(pedido.itens, ['isBonificado', 'produto.descricao'], ['asc', 'asc'])
                    })
                }
            }


            if (filtro.isConferenciaTransportadora === true)
                view = `${this._pathView}/pedidos-fabrica/reports/pedidos/pedido-fabrica-conferencia-transportadora.pug`

            const options = {
                title: `Relatório de Pedidos ${filtro.typeReport}`,
                dataHora: utils.DateUtil.getStringDateAndTime(),
                result: pedidos,
                filtro: filtro,
                data: totalizador
            }

            let key = null


            let generateReport = new utils.ChromePDF()

            if (filtro.typeFormatReport == 'html') 
                key = await generateReport.generateFileHTMLAndGetKeyPugTemplate(`${view}`, options)
             else 
                key = await generateReport.generateFileAndGetKeyPugTemplate(`${view}`, options)

            return res.json({ key: key })
        })
    }

}

module.exports = (app) => {
    return new PedidoFabricaController(app).router()
}