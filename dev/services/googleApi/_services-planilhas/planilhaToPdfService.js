const authService = require('../_auth/authService')
const utils = require('../../../helpers/_utils/utils')
const async = require('async')
const ImagemAggileDistribuidoraService = require('../_services-driver/imagemAggileDistribuidoraService')
const _ = require('lodash')
const fs = require('fs')

let { google } = require('googleapis')

let _instance = null

const classificacao = {
    'vinhos': ['Graciema'],
    'bebidas-quentes': ['Marck'],//,'Multidrink'],
    //'cosmeticos': ['Larimar']
}


const montarMenus = (obj) => {
    return Object.getOwnPropertyNames(obj)
}

const agruparItens = (rows, key) => {
    return _.groupBy(rows, key)
}


class PlanilhaToPDFService {


    static listar(id, range) {
        return new Promise((resolve, reject) => {

            if (range == undefined)
                return reject('Range não definido!')

            authService.run().then((auth) => {

                let sheets = google.sheets('v4')


                sheets.spreadsheets.values.get({
                    auth: auth,
                    spreadsheetId: id,
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


module.exports = PlanilhaToPDFService