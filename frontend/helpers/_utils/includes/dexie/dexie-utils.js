const async = require('async')

const include = {
    jsonUtil : require('../../json-util')(),
    objectUtil : require('../../object-util')(),
    stringUtil : require('../../string-util')()
}


let db = undefined

const iterate = (obj, stack, data = []) => {

    obj = include.jsonUtil.toValuesIndexDb(obj)

    
   

    for (let property in obj) {

        if(/\.\d/ig.test(property))
            continue

        if(!isNaN(property))
            continue


        if(property == 'permissao')
          continue

        if (obj.hasOwnProperty(property)) {

            if(_.isArray(obj[property])){
                let str = ''

                
                obj[property].forEach( (r) => {
                    let aux = ''

                    aux = iterate(r)

                    if(aux.length > str.length)
                        str = aux
                })

                str.split(',').forEach( (r) => {
                    if(r !== '++idKey')
                        data.push(`${property}.${r}`)
                })

                

            }else if (typeof obj[property] == "object") {
                
                if(stack !== undefined)
                    iterate(obj[property], `${stack}.${property}`, data)
                else
                    iterate(obj[property], `${property}`, data)
            } else {

                

                if (stack !== undefined)
                    data.push(`${stack}.${property}`)
                else
                    data.push(property)
            }
        }
    }
    /*
    if(data.indexOf('uuid') === -1)
        data.push('uuid')
    if(data.indexOf('syncServer') === -1)
        data.push('syncServer')
        */
    
    return `++idKey,${data.join(',').replace('id', '&id')}`
}

const links = [
    { table: 'grupos', link: 'listar-grupos', query: { status: 'all' } },
    { table: 'fabricas', link: 'listar-fabricas', query: { status: 'all' } },
    { table: 'volumes', link: 'listar-volumes', query: { status: 'all' } },
    { table: 'tiposUnidade', link: 'listar-tipo-unidade', query: { status: 'all' } },
    { table: 'estados', link: 'listar-estados', query: { status: 'all' } },
    { table: 'municipios', link: 'listar-municipios', query: { status: 'all' } },
    { table: 'tipoEstabelecimentoEnumerador', link : 'listar-tipos-estabelecimentos-enum'},
    { table: 'statusRecebimentos', link: 'listar-status-recebimentos-enum' },
    { table: 'statusDespesas', link: 'listar-status-despesas-enum' },
    { table: 'statusPedido', link: 'listar-status-pedido-enum' },
    { table: 'statusNotasFiscais', link: 'listar-status-nota-fiscal-enum' },
    { table: 'formasPagamento', link: 'listar-formas-pagamento-enum' },
    { table: 'operacaoInventario', link : 'listar-operacao-inventario-enum' },
    { table: 'bancos', link: 'listar-bancos', query: {status : 'all'}},
    {table: 'motivoDevolucaoCheques', link:'listar-motivo-devolucao-cheque'},
    {table: 'statusCheque', link: 'listar-status-cheque-enum'},
    {table: 'origemLancamentoCheque', link: 'listar-origem-lancamento-cheque-enum'},
    {table: 'statusPedidoFabrica', link: 'listar-status-pedido-fabrica-enum'}
    
]

const schemasStructure = async (options = {}) => {

    let deferred = $.Deferred()


    let localUtil = require('../../local-storage-util')

    if (options.newVersion == true || options.newSchema == true)
        await localUtil.removeStorage('__schema__aggile')

    if (localUtil.isStorageItem('__schema__aggile'))
        return await { schemas: JSON.parse(localUtil.getStorage('__schema__aggile')) }

    async.waterfall([

        (done) => {

            let obj = {}
            let datas = {}

            

            async.forEachSeries(links, async (item, next) => {
                let data = await $.post(`/api/sincronizacao/${item.link}`, item.query)
                

                let struct = ''

                data.forEach( (r) => {
                    let aux = ''

                    aux = iterate(r)

                    if(aux.length > struct.length)
                        struct = aux
                })

                

                let auxObj = JSON.parse(`{"${item.table}":"${struct}"}`)



                _.assign(obj, auxObj)

                datas[item.table] = data

                next(null)
            }, (err) => {
                
                if (err)
                    done(err)
                else
                    done(null, { schemas: obj, datas: datas })
            })
        }
    ], (err, data) => {
        localUtil.setStorage('__schema__aggile', JSON.stringify(data.schemas))
        deferred.resolve(data)
    })

    return deferred.promise()
}

class DexieUtil {

    


    static async db(options = {}) {

        if(db && !options.newVersion)
            return await db

        let deferred = $.Deferred()

        async.waterfall([

            async (done) => {

                if (options.newVersion == true)
                    await Dexie.delete('data_aggile_distribuidora')

                let schemas = await schemasStructure(options)

                schemas.options = options

                done(null, schemas)

            },

            async (param = {}, done) => {

                try {

                    let db = new Dexie('data_aggile_distribuidora')
                    

                    db.version(1).stores(param.schemas)
                    

                    await db.open()

                    db = db

                    if(param.options.getConnection == true)
                        done(null, {db : db})
                    else
                        done(null, { db: db, datas: param.datas })

                } catch (err) {
                    done(err)
                }

            }
        ], (err, sucess = {}) => {
            if (err)
                deferred.reject(err)
            else
                deferred.resolve(sucess)
        })

        return deferred.promise()

    }

    static async runAsyncLocalToServer(){
        let deferred = $.Deferred()


        return deferred.promise()
    }

    static async runAsyncServerToApp(options = {}) {

        let deferred = $.Deferred()

        async.waterfall([


            async (done) => {

                this.db(options)
                    .then((r) => { done(null, r) })
                    .catch((err) => { done(err) })
            },


            (param = {}, done) => {



                if (param.datas) {

                    
                    async.forEachSeries(links, (item, nextLinks) => {

                        async.forEachSeries(param.datas[item.table], async (row, nextTable) => {

                            //if(!row.uuid)
                            //    row.uuid = 0

                            //if(!row.syncServer)
                            //    row.syncServer = true

                            row = include.jsonUtil.toValuesIndexDb(row)

                            let itemExists = await param.db[item.table].get({id : parseInt(row.id) })

                            if(itemExists)
                                row.idKey = itemExists.idKey    

                            param.db[item.table].put(row).then(() => {
                                nextTable(null)
                            }).catch((err) => {
                                if (err.name == Dexie.errnames.NotFound) {
                                    nextTable(err)
                                    this.asyncServerToApp({ newVersion: true })
                                }
                            })
                        }, (err) => {
                            if (err)
                                nextLinks(err)
                            else
                                nextLinks(null)
                        })

                    }, (err) => {
                        if (err)
                            done(err)
                        else
                            done(null)
                    })
                } else {
                    done(null)
                }


            }
        ], (err) => {

            if (err)
                deferred.reject(err)
            else
                deferred.resolve(true)

        })

        return deferred.promise()
    }

}


module.exports = DexieUtil