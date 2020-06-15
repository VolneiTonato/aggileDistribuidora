const authService = require('../_auth/authService')
const utils = require('../../../helpers/_utils/utils')
const async = require('async')
const ImagemAggileDistribuidoraService = require('../_services-driver/imagemAggileDistribuidoraService')
const _ = require('lodash')
const fs = require('fs')
const {produtoAggileDistribuidoraService:configProduto} = require('../../../config/credenciais/planilha_drive.json')

let { google } = require('googleapis')


const idPlanilhaProdutos =  configProduto.id

const classificacao = configProduto.classificacao


const montarMenus = (obj) => {
    return Object.getOwnPropertyNames(obj)
}

const agruparItens = (rows, key) => {
    return _.groupBy(rows, key)
}


class produtoAggileDistribuidoraService {


    static listarAllCategory(category) {
        return new Promise((resolve, reject) => {

            async.waterfall([

                (done) => {

                    if (!utils.ObjectUtil.hasProperty(classificacao, category)) {

                        done('Categoria inválida!')

                    } else {



                        let dados = classificacao[category]

                        let options = {
                            data: [],
                            catalogos: {}
                        }

                        async.forEachSeries(dados, (item, next) => {



                            this.listar(`${item}!A1:F`).then((rows) => {



                                rows = _.filter(rows, (o) => {
                                    if ('mostrar' in o)
                                        return o.mostrar === 'TRUE'
                                })



                                ImagemAggileDistribuidoraService.listar(category, item, rows)
                                    .then((data) => {


                                        options.data.push(data.rows)
                                        options.catalogos = data.catalogos


                                        next(null)

                                    }).catch((err) => {

                                        next(err)
                                    })


                            }).catch((err) => {
                                next(err)
                            })

                        }, (err) => {



                            if (err)
                                done(err)
                            else
                                done(null, options)
                        })
                    }
                },

                (param, done) => {

                    if (!param) {

                        done('Sem informações!')

                    } else {

                        let r = {
                            data: [],
                            catalogo: param.catalogos
                        }

                        async.forEachSeries(param.data, (itens, next) => {

                            async.forEachSeries(itens, (item, next1) => {

                                r.data.push(item)

                                next1(null)

                            }, (err) => {
                                next(null)
                            })
                        }, (err) => {
                            done(null, r)
                        })

                    }
                },

                (param, done) => {

                    let retorno = {}




                    retorno.catalogo = param.catalogo
                    retorno.produtos = param.data
                    retorno.menus = montarMenus(agruparItens(param.data, 'classificacao'))


                    done(null, retorno)
                }

            ], (err, success) => {

                if (err)
                    return reject(err)

                return resolve(success)

            })
        })


    }

    static importarProdutosToFileJson() {
        return new Promise((resolve, reject) => {

            let classificacoes = Object.getOwnPropertyNames(classificacao)
           

            console.log('iniciando importação de produtos')

            async.waterfall([

                (done) => {
                    async.forEachSeries(classificacoes, (item, next) => {
                        this.listarAllCategory(item).then((response) => {

                            async.waterfall([

                                (callback) => {

                                    let obj = { type: item, retorno: response }

                                    fs.unlink(`${process.env.DIR_ROOT}/public/imagens/aggile-distribuidora/data-images-${obj.type}-apresentacao.json`,(err) => {

                                    })
                                    
                                    

                                    if ('catalogo' in obj.retorno && (Object.getOwnPropertyNames(obj.retorno.catalogo).length > 0)) {


                                        

                                        fs.writeFile(`${process.env.DIR_ROOT}/public/imagens/aggile-distribuidora/data-images-${obj.type}-apresentacao.json`, JSON.stringify(obj.retorno.catalogo), (err) => {
                                            
                                            obj.retorno.catalogo = {}
                                            if(err)
                                                callback(err)
                                            else
                                                callback(null, obj)
                                        })
                                    }else{
                                        callback(null, obj)
                                    }
                                },

                                (param, callback) => {
                                    fs.unlink(`${process.env.DIR_ROOT}/public/imagens/aggile-distribuidora/data-images-${param.type}.json`, (err) => {
                                        
                                    })
                                    fs.writeFile(`${process.env.DIR_ROOT}/public/imagens/aggile-distribuidora/data-images-${param.type}.json`, JSON.stringify(param), (err) => {
                                        if (err)
                                            callback(err)
                                        else
                                            callback(null)
                                    })
                                }

                            ], (err) => {

                                

                                if(err){
                                    next(err)
                                }else{
                                    next(null)
                                }
                            })

                        }).catch((err) => {
                            next(err)
                        })
                    }, (err) => {
                        if (err) {
                            done(err)
                        } else {
                            done(null)
                        }
                    })
                }

            ], (err, data) => {



                if (err)
                    return reject(err)
                else
                    return resolve('ok')
            })


        })
    }

    static getLitClassificacaoProdutos() {
        return classificacao
    }


    static listar(range) {
        return new Promise((resolve, reject) => {

            if (range == undefined)
                return reject('Range não definido!')

            authService.run().then((auth) => {

                let sheets = google.sheets('v4')



                sheets.spreadsheets.values.get({
                    auth: auth,
                    spreadsheetId: idPlanilhaProdutos,
                    range: `${range}`
                }, (err, response) => {

                    if (err)
                        return reject(`Ocorreu um erro ao buscar dados: ${err}`)


                    let rows = response.data.values



                    if (rows == undefined || (rows.length == 0)) {
                        return reject('Sem informações')
                    } else {
                        try {
                            let data = utils.ArrayUtil.arrayPlanilhaGoogleToJson(rows)
                            return resolve(data)
                        } catch (err) {
                            return reject(err)
                        }
                    }
                });

            }).catch((err) => {
                console.log(err)
                return reject(err)
            })


        })
    }
}


module.exports = produtoAggileDistribuidoraService