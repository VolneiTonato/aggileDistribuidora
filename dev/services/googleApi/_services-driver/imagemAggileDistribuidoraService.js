const authService = require('../_auth/authService')
const utils = require('../../../helpers/_utils/utils')
const async = require('async')
const _ = require('lodash')
const configPlanilha = require('../../../config/credenciais/planilha_drive.json')


let { google } = require('googleapis')

const classificacao = configPlanilha.ImagemAggileDistribuidoraService.empresas



class ImagemAggileDistribuidoraService {



    static listar(type, empresa, rows) {
        return new Promise((resolve, reject) => {


            authService.run().then((auth) => {



                let driver = google.drive({ version: 'v3', auth: auth })

                async.waterfall([

                    (done) => {

                        let empresas = utils.ObjectUtil.get(classificacao, type)


                        let param = {
                            imagem: {},
                            rows: rows,
                            catalogo: {}
                        }


                        async.forEachSeries(empresas, (item, next) => {

                            if (utils.ObjectUtil.hasProperty(item, empresa)) {

                                let columns = Object.getOwnPropertyNames(item[empresa])






                                async.forEachSeries(columns, (tipoImagem, next1) => {

                                    let id = item[empresa][tipoImagem].id

                                    let typeApresentacao = item[empresa][tipoImagem].type || false

                                    let resize = item[empresa][tipoImagem].resize || ''

                                    let isThumbnail = item[empresa][tipoImagem].isThumbnail || false


                                    console.log(empresa, tipoImagem)




                                    if (!id) {
                                        next1(null)
                                    } else if (item[empresa][tipoImagem].isDownload == false) {
                                        next1(null)
                                    } else {

                                        try {

                                            driver.files.list({
                                                q: `'${id}' in parents`
                                            }, (err, response) => {

                                                if (err) {
                                                    next1(err)
                                                } else {

                                                    let data = []


                                                    async.forEachSeries(response.data.files, (item, nextFiles) => {
                                                        let auxItem = {}


                                                        auxItem.codigo = item.name.replace(/\D/g, '')

                                                        let exists = _.find(rows, {codigo : auxItem.codigo})

                                                        

                                                        if(!exists)
                                                            return nextFiles(null)
                                                        

                                                    

                                                        let nameEmpresaHash = utils.CryptUtil.md5(empresa)

                                                        utils.DownloadUtil.downloadImageAndResize(
                                                            `https://drive.google.com/uc?id=${item.id}`,
                                                            `imagens/aggile-distribuidora/bebidas/${type}/${nameEmpresaHash}/${tipoImagem}`,
                                                            `${auxItem.codigo}.png`,
                                                            resize,
                                                        )
                                                            .then((result) => {

                                                                if (isThumbnail == true) {

                                                                    result.image.getBase64(`image/${result.image.getExtension()}`, (err, b) => {

                                                                        if (typeApresentacao)
                                                                            auxItem[tipoImagem] = b //`data:${body.headers["content-type"]};base64,${new Buffer(response, 'binary').toString('base64')}`
                                                                        else
                                                                            auxItem.url = b //`data:${body.headers["content-type"]};base64,${new Buffer(response, 'binary').toString('base64')}`    


                                                                        data.push(auxItem)

                                                                        nextFiles(null)
                                                                    })



                                                                } else {

                                                                    if (typeApresentacao)
                                                                        auxItem[tipoImagem] = `/public/imagens/aggile-distribuidora/bebidas/${type}/${nameEmpresaHash}/${tipoImagem}/${auxItem.codigo}.png`
                                                                    else
                                                                        auxItem.url = `/public/imagens/aggile-distribuidora/bebidas/${type}/${nameEmpresaHash}/${tipoImagem}/${auxItem.codigo}.png`


                                                                    data.push(auxItem)

                                                                    nextFiles(null)
                                                                }




                                                            }).catch((err) => {
                                                                console.log(`Error Download: ${err.toString()}`)
                                                                nextFiles(null)
                                                            })


                                                    }, (err) => {

                                                        if (err) {
                                                            next1(err)
                                                        } else {

                                                            param.resolve = []


                                                            if (typeApresentacao) {

                                                                if (typeApresentacao in param.catalogo && (param.catalogo[typeApresentacao].length > 0)) {

                                                                    data.forEach((item) => {

                                                                        param.catalogo[typeApresentacao].filter((b) => {

                                                                            if (b.codigo == item.codigo) {
                                                                                b[tipoImagem] = item[tipoImagem]
                                                                            }
                                                                        })

                                                                    })

                                                                } else {
                                                                    param.catalogo[typeApresentacao] = data
                                                                }



                                                            } else {



                                                                data.forEach((item) => {


                                                                    let isExists = false


                                                                    param.rows.filter((prd) => {

                                                                        if (!utils.ObjectUtil.hasProperty(prd, 'imagem'))
                                                                            prd.imagem = {}

                                                                        if (!utils.ObjectUtil.hasProperty(prd.imagem, tipoImagem))
                                                                            prd.imagem[tipoImagem] = {}

                                                                        if (prd.codigo == item.codigo) {
                                                                            isExists = true
                                                                            item.isImage = true
                                                                            prd.imagem[tipoImagem] = item
                                                                        }
                                                                    })


                                                                    if (!isExists) {

                                                                        param.rows.filter((produto) => {



                                                                            if (!utils.ObjectUtil.hasProperty(produto, 'imagem'))
                                                                                produto.imagem = {}

                                                                            if (!utils.ObjectUtil.hasProperty(produto.imagem, tipoImagem))
                                                                                produto.imagem[tipoImagem] = {}


                                                                            if (item.codigo == produto.codigo) {
                                                                                item.isImage = true
                                                                                produto.imagem[tipoImagem] = item
                                                                            }

                                                                        })

                                                                    }


                                                                })
                                                            }

                                                            next1(null, param)

                                                        }
                                                    })

                                                }
                                            })
                                        } catch (err) {
                                            next1(err)
                                        }
                                    }

                                }, (err, success) => {



                                    if (err) {
                                        next(err)
                                    } else {
                                        next(null, success)
                                    }
                                })

                            } else {
                                next(null)
                            }

                        }, (err, success) => {
                            if (err)
                                done(err)
                            else
                                done(null, param)
                        })
                    },
                ], (err, success) => {



                    if (err) {
                        return reject(err)
                    } else {

                        return resolve({ rows: success.rows, catalogos: success.catalogo })
                    }
                })

            }).catch((err) => {
                return reject(err)
            })


        })
    }
}


module.exports = ImagemAggileDistribuidoraService