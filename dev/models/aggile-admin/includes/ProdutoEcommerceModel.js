const sequelize = require('./entityes/index')
const _ = require('lodash')
const utilModel = require('../extras/utils-model')
const utils = require('../../../helpers/_utils/utils')


class ProdutoEcommerceModel {

    constructor() {

        this._model = sequelize.entity.ProdutoEcommerce


        process.nextTick(() => {
            this._modelGrupo = require('./grupoModel')
        })
    }


    async saveToProduto(data = {}, options = {}) {

        let dataProdutoEcommerce = data.produtoEcommerce || {}

        if (!dataProdutoEcommerce.descricao)
            dataProdutoEcommerce.descricao = data.descricao


        if (dataProdutoEcommerce.id) {

            let produtoEcommerce = utilModel.LoadModelToFormUtil.loadChangeModel(new sequelize.entity.ProdutoEcommerce(), dataProdutoEcommerce)

            let produtoExistente = await this._model.findOne({ where: { id: dataProdutoEcommerce.id } })

            if (!produtoExistente)
                throw 'Produto Ecommerce inválido'

            utilModel.LoadModelToFormUtil.setData(produtoExistente, produtoEcommerce, [
                'descricao', 'precoVenda', 'isDestaque', 'isEcommerce', 'estoque', 'promocao'
            ])

            return await produtoExistente.save(options)


        } else {
            dataProdutoEcommerce.produtoId = data.id
            return await this._model.create(dataProdutoEcommerce, options)
        }
    }




    async findOne(conditions) {


        let where = {
            where: conditions
        }


        return await this._model.findOne(where)
    }

    async pesquisar(conditions = {}) {

        if (conditions.paginator && ('limit' in conditions.paginator))
            query.limit = parseInt(conditions.paginator.limit)

        if (conditions.paginator && ('offset' in conditions.paginator))
            query.offset = parseInt(conditions.paginator.offset)


        return await this._model.findAll(query)
    }

    async findAll(conditions = {}) {
        let where = {
            include: [{ all: true, nested: true }],
            where: conditions
        }

        return await this._model.findAll(where)

    }


    async findAllToEcommerce(conditions = {}) {

        let where = {
            include: [{ all: true, nested: true }],
            where: conditions
        }

        let produtos = (await this._model.findAll(where)).map(item => item.get({ plain: true }))


        let grupos = (await new this._modelGrupo().findAll()).map(item => item.get({ plain: true }))


        _.filter(produtos, item => {

            item.produto.grupo = _.find(grupos, { id: item.produto.grupoId }) || {}

            if (utils.ObjectUtil.getValueProperty(item, 'produto.grupo.grupoEcommerce.isEcommerce') == true) {

                return item
            } else {
                item.isEcommerce = false
                return item
            }
        })

        _.map(produtos, item => {
            let prd = item.produto

            item.produto = {
                id : prd.id,
                peso: prd.peso,
                altura : prd.altura,
                largura: prd.largura,
                comprimento: prd.comprimento,
                fracao : prd.fracao,
                graduacaoAlcoolica: prd.graduacaoAlcoolica,
                descricaoDetalhada: prd.descricaoDetalhada,
                volume: prd.volume,
                tipoUnidade: prd.tipoUnidade,
                grupo: prd.grupo,
                referencia: prd.referencia,
                grupoId: prd.grupoId,
                volumeId: prd.volumeId,
                tipoUnidadeId : prd.tipoUnidadeId
            }
            return item
        })

        return _.filter(produtos)



    }

    async atualizarEstoqueEcommerce(inventario = {}, options = {}) {

        if (['FARDO', 'UNITARIO'].indexOf(inventario.tipoUnidade) == -1)
            throw 'tipo unidade obrigatório'

        let produto = await this._model.findOne({ where: { id: inventario.produtoId } })


        if (inventario.operacao == 'contagem_de_estoque') {

            if (inventario.tipoUnidade == 'UNITARIO')
                produto.estoqueUnitario = parseInt(inventario.quantidade)
            else
                produto.estoqueAtual = parseInt(inventario.quantidade)

        } else if (/entrada/ig.test(inventario.operacao)) {
            if (inventario.tipoUnidade == 'UNITARIO')
                produto.estoqueUnitario = parseInt(produto.estoqueUnitario) + parseInt(inventario.quantidade)
            else
                produto.estoqueAtual = parseInt(produto.estoqueAtual) + parseInt(inventario.quantidade)
        } else {

            if (inventario.tipoUnidade == 'UNITARIO')
                produto.estoqueUnitario = parseInt(produto.estoqueUnitario) - parseInt(inventario.quantidade)
            else
                produto.estoqueAtual = parseInt(produto.estoqueAtual) - parseInt(inventario.quantidade)
        }



        return await produto.save(options)
    }

}


module.exports = ProdutoEcommerceModel