const utils = require('../../../helpers/_utils/utils')
const modelReport = require('../models/model')
const aggileModel = require('../../../models/aggile-admin/aggileAdminModel')
const pathView = `${__dirname}/../views`
const _ = require('lodash')

const reports = [
    { name: 'romaneio', templateId: '#template-report-pedido-romaneio', href: '/reports/pedidos/report-romaneio', titulo: 'Romaneio' },
    { name: 'pedidoCliente', templateId: '#template-report-pedido-cliente-geral', href: '/reports/pedidos/report-cliente-geral', titulo: 'Pedidos' }
]

const reportCliente = async (req, res) => {

    let pedido = await new aggileModel.PedidoClienteModel().findOne({ uuid: req.params.uuid })

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

    let view = `${pathView}/pedidos/reports/pedidos/pedido-cliente-geral.pug`


    if (filtro.typeFormatReport == 'html') {
        key = await generateReport.generateFileHTMLAndGetKeyPugTemplate(`${view}`, options)

        res.contentType('text/html').send(await generateReport.getHTMLToKey(key))

    } else {
        key = await generateReport.generateFileAndGetKeyPugTemplate(`${view}`, options)

        res.contentType('application/pdf').send(await generateReport.getPdfToKey(key))
    }
}

class PedidoController {

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
            res.render(`${this._pathView}/pedidos/index.pug`, { reports: reports })
        })

        this._router.get('/cliente-report-view-anonymous/:uuid', reportCliente)

        this._router.get('/report-cliente/:uuid', reportCliente)


        this._router.post('/report-cliente-geral', async (req, res) => {

            let filtro = req.body.report

            let pedidos = await new modelReport.PedidoReportModel().pedidosClienteGeral(_.clone(filtro))


            let view = `${this._pathView}/pedidos/reports/pedidos/pedido-cliente-geral.pug`

            let totalizador = {}

            if (filtro.typeReport == 'resumido') {
                view = `${this._pathView}/pedidos/reports/pedidos/pedido-geral-resumido.pug`

                let data = _.chain(pedidos)
                    .groupBy('clienteRef.id')
                    .toPairs()
                    .map((item) => { return _.zipObject(['clienteId', 'pedidos'], item) })
                    .each((item) => { item.clienteRef = (_.head(item.pedidos) || {}).clienteRef })
                    .each((item) => { item.pedidos = _.orderBy(item.pedidos, ['status'], ['asc']) })
                    .each((item) => {

                        item.totalizador = {
                            totalPedido: _.sum(_.map(item.pedidos, x => { return utils.NumberUtil.cdbl(x.total) })),
                            totalItens: _.sumBy(item.pedidos, 'totalItens')
                        }


                        
                        if(filtro.visualizacaoPedidoReport == 'resumirPedido'){

                            view = `${this._pathView}/pedidos/reports/pedidos/pedido-geral-resumido-sem-produtos.pug`

                            item.pedidos.map(element => {
                                element.itens = undefined
                            })



                        }



                    })

                    .each((item) => {
                        item.pedidos.map((pedido) => {
                            if(_.isArray(pedido.itens))
                                pedido.itens = _.orderBy(pedido.itens, ['isBonificado', 'produto.descricao'], ['asc', 'asc'])
                        })
                    })
                    .each((item) => {
                        totalizador.totalGeralPedido = utils.NumberUtil.sum(totalizador.totalGeralPedido, item.totalizador.totalPedido)
                        totalizador.totalGeralItens = utils.NumberUtil.sum(totalizador.totalGeralItens, item.totalizador.totalItens)
                    })
                    .value()

                pedidos = data
            } else {
                if (pedidos.length > 0) {
                    pedidos.forEach(pedido => {
                        if(_.isArray(pedido.itens))
                            pedido.itens = _.orderBy(pedido.itens, ['isBonificado', 'produto.descricao'], ['asc', 'asc'])
                    })
                }
            }

            
            const options = {
                title: `Relatório de Pedidos ${filtro.typeReport}`,
                dataHora: utils.DateUtil.getStringDateAndTime(),
                result: pedidos,
                filtro: filtro,
                data: totalizador
            }

            let key = null

            let generateReport = new utils.ChromePDF()



            if (_.get(filtro, 'typeFormatReport') == 'html')
                key = await generateReport.generateFileHTMLAndGetKeyPugTemplate(`${view}`, options)
            else
                key = await generateReport.generateFileAndGetKeyPugTemplate(`${view}`, options)


            return res.json({ key: key })
        })




        this._router.post('/report-romaneio', async (req, res) => {
            let rows = {}

            let filtro = req.body.report || {}

            try {
                rows = await new modelReport.PedidoReportModel().romaneio(_.clone(filtro))
                if (utils.NumberUtil.cdbl(utils.ObjectUtil.getValueProperty(rows, 'length')) <= 0)
                    throw 'Não existem pedidos para este período!'
            } catch (err) {
                return res.json({ status: 500, message: err })
            }


            let data = { filtro: filtro }




            rows.forEach((row) => {
                data.total = utils.NumberUtil.sum(data.total, utils.NumberUtil.cdbl(row.total))
                data.totalQuantidadeFD = utils.NumberUtil.sum(data.totalQuantidadeFD, row.quantidadeFD)
                data.totalQuantidadeUN = utils.NumberUtil.sum(data.totalQuantidadeUN, row.quantidadeUN)
                data.pesoFD = utils.NumberUtil.sum(data.pesoFD, utils.NumberUtil.multiplicacao(row.quantidadeFD, row.peso))
                data.pesoUN = utils.NumberUtil.sum(data.pesoUN, utils.NumberUtil.multiplicacao(row.quantidadeFD, utils.NumberUtil.divisao(row.peso, row.fracao)))
            })


            let key = null

            const view = `${this._pathView}/pedidos/reports/romaneio/romaneio.pug`

            const options = {
                title: 'Relatório de Romaneio',
                dataHora: utils.DateUtil.getStringDateAndTime(),
                pedidos: rows,
                data: data,
                filtro: filtro
            }

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
    return new PedidoController(app).router()
}