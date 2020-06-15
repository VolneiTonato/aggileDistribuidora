const utils = require('../../../helpers/_utils/utils')
const modelReport = require('../models/model')
const _ = require('lodash')

const reports = [
    { name: 'estoque', templateId: '#template-report-produto-estoque', href: '/reports/produtos/report-estoque', titulo: 'Estoque' }
]

class ProdutoController {

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
            res.render(`${this._pathView}/produtos/index.pug`, {reports : reports})
        })

        this._router.post('/report-estoque', async (req, res) => {

            let filtro = req.body.report

            let produtos = await new modelReport.ProdutoReportModel().estoque(_.clone(filtro))

            let data = {}

            produtos.forEach(item => {
                data.totalPacotesFD = utils.NumberUtil.sum(data.totalPacotesFD, item.estoqueAtual)
                data.totalPacotesUN = utils.NumberUtil.sum(data.totalPacotesUN, item.estoqueUnitario)

                data.totalPesoFD = utils.NumberUtil.sum(data.totalPesoFD,  utils.NumberUtil.multiplicacao(item.peso, item.estoqueAtual))
                data.totalPesoUN = utils.NumberUtil.sum(data.totalPesoUN,  utils.NumberUtil.multiplicacao( utils.NumberUtil.divisao(item.peso, item.fracao), item.estoqueUnitario))

                data.totalCustoFD = utils.NumberUtil.sum(data.totalCustoFD,  utils.NumberUtil.multiplicacao(item.estoqueAtual, item.custo))
                data.totalCustoUN = utils.NumberUtil.sum(data.totalCustoUN,  utils.NumberUtil.multiplicacao(item.estoqueUnitario,  utils.NumberUtil.divisao(item.custo, item.fracao)))


                data.precoVendaFD = utils.NumberUtil.sum( data.precoVendaFD, utils.NumberUtil.multiplicacao( item.estoqueAtual , item.precoVenda))
                data.precoVendaUN = utils.NumberUtil.sum(data.precoVendaUN, utils.NumberUtil.multiplicacao( utils.NumberUtil.divisao(item.precoVenda, item.fracao) ,  item.estoqueUnitario))

            })

            

            data.totalPrecoVenda = utils.NumberUtil.sum(data.precoVendaFD, data.precoVendaUN)
            data.totalCusto = utils.NumberUtil.sum(data.totalCustoFD, data.totalCustoUN)
            data.totalPeso = utils.NumberUtil.sum(data.totalPesoFD, data.totalPesoUN)

            const view = `${this._pathView}/produtos/reports/estoque.pug`

            let options = {
                title: 'Relatório de Estoque',
                dataHora: utils.DateUtil.getStringDateAndTime(),
                produtos : produtos,
                data : data,
                filtro: filtro
            }

            let key = null

            let generateReport = new utils.ChromePDF()


            if(_.get(filtro, 'typeFormatReport') == 'html')
                key = await generateReport.generateFileHTMLAndGetKeyPugTemplate(`${view}`,options)
            else
                key = await generateReport.generateFileAndGetKeyPugTemplate(`${view}`,options)


            return res.json({key : key})

        })
    }

}

module.exports = (app) => {
    return new ProdutoController(app).router()
}