const sequelize = require('./entityes/index')
const async = require('async')
const crud = require('../extras/includes/crud')
const utils = require('../../../helpers/_utils/utils')

const estoqueToInventario = async (inventario, options) => {


    let query = `
            SELECT coalesce(sum(entrada - saida),0)as total, fracao, descricao
        FROM(
            select sum(quantidade) AS entrada, 0 as saida, produtos.fracao as fracao, produtos.descricao as descricao from movimentacao 
            join produtos on produtos.id = movimentacao.produto_id
                where tipo_movimentacao in ('entrada_nota','entrada_ajuste_estoque_automatica', 'entrada_ajuste_estoque', 'cancelamento_pedido_cliente','estorno_pedido_cliente','contagem_de_estoque') 
            AND produto_id = :produtoId

        UNION 

            select 0 as entrada, sum(quantidade) as saida, produtos.fracao as fracao, produtos.descricao as descricao from movimentacao 
            JOIN produtos on produtos.id = movimentacao.produto_id
                where  tipo_movimentacao in('cancelamento_entrada_nota','saida_ajuste_estoque_automatica', 'estorno_entrada_nota', 'pedido_cliente','saida_ajuste_estoque' ) 
            AND produto_id = :produtoId )AS DATA;
    `

    let row = await crud.queryFindOne(query, { produtoId: inventario.produtoId }, options)

    row.total = utils.NumberUtil.cInt(row.total)


    let estoque = {
        UN: 0,
        FD: 0,
        FRACAO: row.fracao,
        PRODUTO: row.descricao,
        TOTAL: row.total
    }


    estoque.UN = utils.NumberUtil.mod(row.total, row.fracao)



    if (estoque.UN > 0)
        estoque.FD = utils.NumberUtil.divisao(utils.NumberUtil.diminuir(row.total, estoque.UN), row.fracao)
    else
        estoque.FD = utils.NumberUtil.cInt(utils.NumberUtil.divisao(row.total, row.fracao))


    if (estoque.FD < 0 && estoque.UN < 0 && ['entrada', 'contagem_de_estoque'].indexOf(inventario.operacao) === -1)
        return new Error(`Oops, sem quantidade disponível para o produto: ${estoque.PRODUTO}`)



    return estoque

}


const atualizarQuantidadesParaZero = (data, fracao, inventario, options) => {

    return new Promise((resolve, reject) => {


        let estoques = [{ type: 'FARDO', qtd: data.FD, fracao: fracao }, { type: 'UNITARIO', qtd: data.UN, fracao: 1 }]

      

        

        async.eachSeries(estoques, (est, next) => {
            if (est.qtd < 0) {


                let movimentacao = {
                    quantidade: Math.abs(est.qtd) * est.fracao,
                    tipoMovimentacao: `entrada_ajuste_estoque_automatica`,
                    produtoId: inventario.produtoId,
                    inventarioId: inventario.id,
                    fracao: est.fracao,
                    tipoUnidade: est.type,
                    usuarioId: inventario.usuarioId
                }


                
                sequelize.entity.Movimentacao.create(movimentacao, options)
                    .then(ok => { next(null) })
                    .catch(err => { next(err) })

                    

            }else{
                next(null)
            }
        }, (err) => {
            if (err)
                return reject(err)
            return resolve(true)
        })

    })

}


class MovimentacaoModel {

    constructor() {
        this._model = sequelize.entity.Movimentacao
    }




    async registrarInventario(inventario, options) {

        return new Promise((resolve, reject) => {



            async.waterfall([

                async (done) => {



                    let rowFracao = { fracao: 1 }


                    let data = await estoqueToInventario(inventario).catch(err => { return done(err)})


                    if (inventario.tipoUnidade == 'FARDO')
                        rowFracao = await crud.queryFindOne('SELECT fracao FROM produtos WHERE id = :id', { id: inventario.produtoId })

                    if (data.TOTAL < 0 && inventario.operacao == 'contagem_de_estoque')
                        await atualizarQuantidadesParaZero(data, rowFracao.fracao, inventario, options).catch(err => { return done(err)})
                    

                    let estoque = inventario.tipoUnidade == 'FARDO' ? data.FD : data.UN
                    

                    let tipoMovimentacao = {}
                    let status = ''

                    if (inventario.operacao == 'contagem_de_estoque')
                        status = inventario.operacao
                    else
                        status = `${inventario.operacao}_ajuste_estoque`

                    let param = {
                        tipo: status,
                        options: options,
                        fracao: rowFracao.fracao
                    }


                    if (estoque != 0) {

                        if (status == 'contagem_de_estoque' && estoque > 0) {


                            tipoMovimentacao = { reverse: 'saida', status: 'entrada_ajuste_estoque_automatica' }
                            //else
                            //    tipoMovimentacao = { reverse: 'entrada', status: 'saida_ajuste_estoque_automatica' }

                            let movimentacao = {
                                quantidade: Math.abs(estoque) * rowFracao.fracao,
                                tipoMovimentacao: `${tipoMovimentacao.reverse}_ajuste_estoque_automatica`,
                                produtoId: inventario.produtoId,
                                inventarioId: inventario.id,
                                fracao: rowFracao.fracao,
                                tipoUnidade: inventario.tipoUnidade,
                                usuarioId: inventario.usuarioId
                            }

                            this._model.create(movimentacao, options).then((r) => {
                                done(null, param)
                            }).catch((err) => {
                                done(err)
                            })


                        } else {
                            done(null, param)
                        }

                    } else {
                        done(null, param)
                    }

                },

                (param, done) => {

                    


                    let movimentacao = {
                        quantidade: parseInt(inventario.quantidade) * (inventario.tipoUnidade == 'FARDO' ? param.fracao : 1),
                        tipoMovimentacao: `${param.tipo}`,
                        produtoId: inventario.produtoId,
                        inventarioId: inventario.id,
                        fracao: param.fracao || 1,
                        tipoUnidade: inventario.tipoUnidade,
                        usuarioId: inventario.usuarioId
                    }

                    


                    this._model.create(movimentacao, param.options).then((r) => {
                        done(null)
                    }).catch((err) => {
                        done(err)
                    })

                    

                }
            ], (err, success) => {
                if (err)
                    return reject(err)
                return resolve()
            })

        })
    }

    async cancelarEntradaNota(notaEntrada, itens = [], options) {
        return await this.registrarEntradaNota(notaEntrada, itens, options, 'cancelamento_entrada_nota')
    }

    async estornarEntradaNota(notaEntrada, itens = [], options) {
        return await this.registrarEntradaNota(notaEntrada, itens, options, 'estorno_entrada_nota')
    }

    async registrarEntradaNota(notaEntrada, itens = [], options, operacao = '') {


        return new Promise((resolve, reject) => {

            if (!'itens_notas_entrada' in itens)
                return reject('Itens inválidos!')


            async.waterfall([

                (done) => {

                    if (operacao == '') {

                        this._model.findOne({
                            where: { notaEntradaId: notaEntrada.id, tipoMovimentacao: 'entrada_nota' }
                        }).then((r) => {
                            this._model.destroy({
                                where: { notaEntradaId: notaEntrada.id, tipoMovimentacao: 'entrada_nota' }
                            }).then((r) => {
                                done(null)
                            }).catch((err) => { done(err) })
                        }).catch((err) => {
                            done(err)
                        })

                    } else {
                        done(null)
                    }

                },

                (done) => {



                    let status = operacao !== '' ? operacao : 'entrada_nota'


                    async.eachSeries(itens, (item, next) => {

                        let fracao = item.tipoUnidade == 'FARDO' ? item.produto.fracao : 1


                        let movimentacao = {
                            quantidade: utils.NumberUtil.multiplicacao(item.quantidade, fracao),
                            tipoMovimentacao: status,
                            produtoId: item.produtoId,
                            notaEntradaId: item.notaEntradaId,
                            fracao: fracao,
                            tipoUnidade: item.tipoUnidade,
                            usuarioId: notaEntrada.usuarioId
                        }


                        this._model.create(movimentacao, options).then((r) => {

                            next(null)

                        }).catch((err) => {
                            next(err)
                        })

                    }, (err) => {
                        if (err)
                            done(err)
                        else
                            done(null)
                    })
                }
            ], (err, success) => {
                if (err)
                    return reject(err)
                return resolve()
            })

        })

    }


    async cancelarSaidaPedido(pedido, itens = [], options) {
        return await this.registrarSaidaPedido(pedido, itens, options, 'cancelamento_pedido_cliente')
    }

    async estornarSaidaPedido(pedido, itens = [], options) {
        return await this.registrarSaidaPedido(pedido, itens, options, 'estorno_pedido_cliente')
    }


    async registrarSaidaPedido(pedido, itens = [], options, operacao = '') {


        return new Promise((resolve, reject) => {

            if (!'itens_pedidos_cliente' in itens)
                return reject('Itens inválidos!')


            async.waterfall([

                (done) => {




                    if (operacao == '') {


                        this._model.findOne({
                            where: { pedidoClienteId: pedido.id, tipoMovimentacao: 'pedido_cliente' }
                        }).then((r) => {

                            this._model.destroy({
                                where: { pedidoClienteId: pedido.id, tipoMovimentacao: 'pedido_cliente' }
                            }).then((r) => {
                                done(null)
                            }).catch((err) => { done(err) })
                        }).catch((err) => {
                            done(err)
                        })
                    } else {
                        done(null)
                    }

                },

                async (done) => {

                    let status = operacao !== '' ? operacao : 'pedido_cliente'

                    async.eachSeries(itens, async (item, next) => {


                        let movimentacao = {
                            quantidade: item.quantidade * (item.tipoUnidade == 'FARDO' ? item.produto.fracao : 1),
                            tipoMovimentacao: status,
                            produtoId: item.produtoId,
                            pedidoClienteId: item.pedidoClienteId,
                            fracao: item.tipoUnidade == 'FARDO' ? item.produto.fracao : 1,
                            tipoUnidade: item.tipoUnidade,
                            usuarioId: pedido.usuarioId
                        }


                        this._model.create(movimentacao, options).then((r) => {

                            next(null)

                        }).catch((err) => {
                            next(err)
                        })

                    }, (err) => {
                        if (err)
                            done(err)
                        else
                            done(null)
                    })
                }
            ], (err, success) => {
                if (err)
                    return reject(err)
                return resolve()
            })

        })

    }


}


module.exports = MovimentacaoModel





