const sequelize = require('./entityes/index')
const _ = require('lodash')
const utilModel = require('../extras/utils-model')
const utils = require('../../../helpers/_utils/utils')
const async = require('async')



class GrupoEcommerceModel {

    constructor() {

        this._model = sequelize.entity.GrupoEcommerce

        process.nextTick(() => {
            this._modelGrupoEcommerce = require('./grupoModel')
        })



    }


    async removeAll(grupos, options = {}) {

        let gruposEcommerce = await this._model.findAll()

        return await Promise.all(gruposEcommerce.map(async item => {
            let grupoExistente = _.find(grupos, { id: item.grupoId })
            if (!grupoExistente)
                await item.destroy({ force: true }, options)
        }))


    }


    async saveToGrupo(data = [], options = {}) {

        let dataGrupoEcommerce = data.grupoEcommerce || {}

        let ajustarLink = text => { return utils.StringUtil.toLowerCase(text.replace(/\s+/ig, '-').replace(/--+/ig, '')) }

        let ajustarBreadCrumbLink = text => { return utils.StringUtil.toLowerCase(text.replace(/\s+->\s+/ig, '\/').replace(/\s+/ig, '-').replace(/--+/ig, '')) }

        if (!dataGrupoEcommerce.descricao)
            dataGrupoEcommerce.descricao = data.descricao

        
        dataGrupoEcommerce.link = ajustarLink(dataGrupoEcommerce.descricao)

        

        if (data.breadCrumb) {
            dataGrupoEcommerce.breadCrumbLink = ajustarBreadCrumbLink(data.breadCrumb)
            dataGrupoEcommerce.link = `${dataGrupoEcommerce.breadCrumbLink}/${dataGrupoEcommerce.link}`
            
        }


        let grupoUnique = await utilModel.CrudUtil.uniqueField(this._model, dataGrupoEcommerce.id, { grupoId: data.id })


        if (grupoUnique)
            throw `Grupo Ecommerce já cadastrado! ${dataGrupoEcommerce.descricao}`


        if (dataGrupoEcommerce.id) {

            let grupoEcommerce = utilModel.LoadModelToFormUtil.loadChangeModel(new sequelize.entity.GrupoEcommerce(), dataGrupoEcommerce)

            let grupoEcommerceExistente = await this._model.findOne({ where: { id: dataGrupoEcommerce.id } })

            if (!grupoEcommerceExistente)
                throw 'Produto Ecommerce inválido'

            utilModel.LoadModelToFormUtil.setData(grupoEcommerceExistente, grupoEcommerce, [
                'descricao', 'descricaoDetalhada', 'isPrincipalMenuEcommerce', 'isEcommerce', 'ordemMenuEcommerce', 'breadCrumb','link','breadCrumbLink'
            ])

            return await grupoEcommerceExistente.save(options)


        } else {

            dataGrupoEcommerce.grupoId = data.id

            return await this._model.create(dataGrupoEcommerce, options)
        }
    }




    async findOne(conditions) {


        let where = {
            //include: relation().RelationProdutoEcommerce,
            include: [{ all: true, nested: true }],
            where: conditions
        }


        return await this._model.findOne(where)
    }

    async pesquisar(conditions = {}) {

        let where = {}



        if (conditions.paginator && ('limit' in conditions.paginator))
            query.limit = parseInt(conditions.paginator.limit)

        if (conditions.paginator && ('offset' in conditions.paginator))
            query.offset = parseInt(conditions.paginator.offset)


        return await this._model.findAll(query)
    }

    async findAllMapGrupo(conditions = {}, options = {}) {

        let gruposEcommerce = (await this.findAll({ isEcommerce: true })).map(el => el.get({ plain: true }))


        let grupos = (await new this._modelGrupoEcommerce().findAll(conditions)).map(el => el.get({ plain: true }))

        if (grupos.length == 0)
            return []

        let allGrupos = (await new this._modelGrupoEcommerce().findAll()).map(el => el.get({ plain: true }))


        let ajustarLink = text => { return utils.StringUtil.toLowerCase(text.replace(/\s/ig, '-')) }

        let ajustarBreadCrumbLink = text => { return utils.StringUtil.toLowerCase(text.replace(/\s->\s/ig, '\/').replace(/\s/ig, '-')) }


        _.map(gruposEcommerce, item => {
            item.link = ajustarLink(item.descricao)

            if (item.grupo.breadCrumb) {
                item.breadCrumbLink = ajustarBreadCrumbLink(item.grupo.breadCrumb)
                item.link = `${item.breadCrumbLink}/${item.link}`
            }

            return item

        })


        let mapGrupos = grupo => {
            let map = item => {
                if (item.grupoEcommerceId) {
                    item.grupoEcommerce = _.find(gruposEcommerce, { grupoId: item.id })
                    if (item.grupoPai)
                        item.grupoPai = map(item.grupoPai)
                }

                return item

            }
            return map(grupo)
        }

        //_.map(allGrupos, mapGrupos)
        // _.map(grupos, mapGrupos)



        let mapGrupoPai = grupo => {

            let map = item => {
                if (item.grupoPaiId) {
                    item.grupoPai = _.find(allGrupos, { id: item.grupoPaiId })

                    if (utils.ObjectUtil.getValueProperty(item, 'grupoPai.grupoPaiId'))
                        item.grupoPai.grupoPai = map(item.grupoPai.grupoPaiId)
                }

                return item
            }

            return map(grupo)
        }

        // _.map(allGrupos, mapGrupoPai)
        // _.map(grupos, mapGrupoPai)
        /*
                function propertiesToArray(obj) {
        
                    obj = utils.JsonUtil.toReParse(obj)
                    
                    const isObject = val =>
                        typeof val === 'object' && !Array.isArray(val);
                
                    const addDelimiter = (a, b) =>
                        a ? `${a}.${b}` : b;
                
                    const paths = (obj = {}, head = '') => {
                        return Object.entries(obj)
                            .reduce((product, [key, value]) => 
                                {
                                    let fullPath = addDelimiter(head, key)
                                    return isObject(value) ?
                                        product.concat(paths(value, fullPath))
                                    : product.concat(fullPath)
                                }, []);
                    }
                
                    return paths(obj);
                }
        
        
                let x = _.clone(allGrupos)
                
        
                let a = _.map(x, propertiesToArray)
        */


        _.map(grupos, grupo => {

            let childrens = _.filter(allGrupos, { grupoPaiId: grupo.id }) || []

            if (utils.ArrayUtil.length(childrens) > 0) {

                let results = childrens.map(item => {
                    if (options.isExportacaoEcommerce) {
                        return _.find(grupos, (op) => {

                            return op.id === item.id && op.grupoEcommerce.isEcommerce == true
                        })
                    } else {
                        return _.find(grupos, { id: item.id }) || {}
                    }
                })


                grupo.childrens = utils.JsonUtil.toReParse(_.filter(results))

                return grupo

            }
        })

        /*
        allGrupos.forEach(item => {
            if (item.id == 13) {
                console.log(item)
            }
        })*/

        let parentsIdRef = (item, ids = []) => {

            if (utils.ArrayUtil.length(item.childrens)) {
                ids.push(item.id)

                item.childrens.forEach(gp => {
                    ids.push(gp.id)

                    let current = _.find(grupos, { id: gp.id })

                    if (current)
                        parentsIdRef(current, ids)
                })
            } else {
                ids.push(item.id)
            }
        }

        _.map(grupos, grupo => {

            grupo.parentsId = []

            parentsIdRef(grupo, grupo.parentsId)

            grupo.parentsId = _.uniq(grupo.parentsId)

            return grupo
        })

        return grupos
    }



    async findAllToEcommerce() {



        let gruposEcommerce = (await this.findAll({ isEcommerce: true })).map(el => el.get({ plain: true }))

        let grupos = await new this._modelGrupoEcommerce().findAllMapGrupo({}, { isExportacaoEcommerce: true })

        /*

        let mapRecursiveGrupoEcomerceToGrupo = (item) => {

            item = _.find(grupos, { id: item.grupoId })

            if (utils.ObjectUtil.getValueProperty(item, 'grupo.grupoPaiId')) {
                item.grupoPai = _.find(grupos, { id: item.grupo.grupoPaiId })

                if (utils.ObjectUtil.getValueProperty(item, 'grupoPai.grupoPaiId')) {
                    item.grupoPai.grupoPai = _.find(grupos, { id: item.grupoPai.grupoPaiId })
                    item.grupoPai.grupoPai = mapRecursiveGrupoEcomerceToGrupo(item.grupoPai.grupoPai)
                }
            }


            return item
        }
        
        _.map(gruposEcommerce, item => {
            mapRecursiveGrupoEcomerceToGrupo(item.grupo)
        })*/

        return await grupos


        let cache = []

        let mapRecursiveGruposEcommerce = async (item) => {

            let exists = _.find(cache, { id: item.grupoEcommerceId })

            if (exists) {

                item.grupoEcommerce = exists.data
            } else {

                if (item.grupoEcommerceId) {
                    item.grupoEcommerce = _.find(gruposEcommerce, { id: item.grupoEcommerceId })
                    cache.push({ id: item.grupoEcommerceId, data: item.grupoEcommerce })
                }

                if (utils.ObjectUtil.getValueProperty(item, 'grupoPai.grupoEcommerceId')) {
                    return await mapRecursiveGruposEcommerce(item.grupoPai)

                }
            }

            return item
        }

        let cacheChildrem = []

        let mapChildrens = async (item) => {

            async.waterfall([
                (done) => {
                    if (item.childrens) {
                        async.mapSeries(item.childrens, async (childrem, next) => {
                            let itemEcommerce = _.find(cacheChildrem, { id: childrem.id })
                            let existsPai = false

                            console.log(utils.ObjectUtil.getValueProperty(itemEcommerce, 'data.grupo.descricao'))


                            if (itemEcommerce) {
                                childrem = itemEcommerce.data

                                if (utils.ObjectUtil.getValueProperty(childrem, 'grupo.grupoPaiId')) {
                                    existsPai = _.find(cacheChildrem, { id: childrem.grupo.grupoPaiId })

                                    if (exists)
                                        childrem.grupo.grupoPai = existsPai.data
                                }


                            } else {
                                itemEcommerce = _.find(gruposEcommerce, { grupoId: childrem.id })

                                if (itemEcommerce) {
                                    
                                    childrem = itemEcommerce

                                    childrem.grupo = _.find(grupos, { id: childrem.grupoId }) || {}

                                    console.log(childrem.grupo.descricao)

                                    cacheChildrem.push({ id: childrem.id, data: childrem })
                                }
                            }
                            next(null)
                            /*
                            if (!existsPai && utils.ObjectUtil.getValueProperty(childrem, 'grupo.grupoPaiId')){
                                console.log("entro")
                                existsPai = _.find(cacheChildrem, { id: childrem.grupo.grupoPaiId })
                                if(existsPai)
                                    childrem.grupo.grupoPai = existsPai
                                else
                                    return await mapChildrens(childrem.grupo.grupoPai)
                            }else{
                                next(null)
                            }*/

                        }, (err) => {
                            done(null, item)
                        })
                    }else{
                        done(null, item)
                    }

                    

                }

            ], (err, success) => {
                console.log('terminou')

                return item
            })

            /*

            if (item.childrens) {
                item.childrens = _.map(item.childrens, async childrem => {

                    let itemEcommerce = _.find(cacheChildrem, { id: childrem.id })
                    let existsPai = null

                    console.log(utils.ObjectUtil.getValueProperty(itemEcommerce, 'data.grupo.descricao'))


                    if (itemEcommerce) {
                        childrem = itemEcommerce.data

                        if (utils.ObjectUtil.getValueProperty(childrem, 'grupo.grupoPaiId')) {
                            existsPai = _.find(cacheChildrem, { id: childrem.grupo.grupoPai })

                            if (exists)
                                childrem.grupo.grupoPai = existsPai.data
                        }


                    } else {
                        itemEcommerce = _.find(gruposEcommerce, { grupoId: childrem.id })

                        if (itemEcommerce) {
                            childrem = itemEcommerce

                            childrem.grupo = _.find(grupos, { id: childrem.grupoId }) || {}

                            cacheChildrem.push({ id: childrem.id, data: childrem })
                        }
                    }




                    if (!existsPai && utils.ObjectUtil.getValueProperty(childrem, 'grupo.grupoPaiId'))
                        return await mapChildrens(childrem.grupo.grupoPai)
                    //childrem.grupo.grupoPai = _.find(grupos, { id: childrem.grupoId }) || {} //mapChildrens(childrem.grupo.grupoPai)


                    return childrem

                })
            }

            if (utils.ObjectUtil.getValueProperty(item, 'grupoPai.childrens')) {
                let existsPai = _.find(cacheChildrem, { id: item.grupoPaiId })
                if (existsPai)
                    item.grupoPai = existsPai
                else
                    return await mapChildrens(item.grupoPai)
            }

            return item*/
        }



        return new Promise((resolve, reject) => {



            async.waterfall([
                (done) => {
                    async.mapSeries(grupos, (item, next) => {
                        setTimeout(async () => {

                            await mapRecursiveGruposEcommerce(item)

                            next()

                        }, 500);
                    }, () => {
                        done(null)
                    })
                },
                (done) => {
                    async.mapSeries(grupos, (item, next) => {


                        setTimeout(async () => {

                            await mapChildrens(item)

                            next()

                        }, 200);
                        


                    }, () => {
                        done(null)
                    })
                },
            ], (err, result) => {

                //grupos = JSON.parse(flatted.stringify(grupos))

                grupos.forEach(item => {
                    if (item.id == 13) {
                        console.log(item.childrens[0].grupoPai.childrens)
                        console.log(item.childrens[0].childrens)
                    }
                })

                return resolve(grupos)
            })

        })



        //_.map(grupos, mapRecursiveGruposEcommerce)



        /*
        let mapChildrens = (item) => {
            if (item.childrens) {
                item.childrens = _.map(item.childrens, childrem => {
                    let itemEcommerce = _.find(gruposEcommerce, { grupoId: childrem.id })

                    if (itemEcommerce) {

                        childrem = _.clone(itemEcommerce)

                        childrem.grupo = _.find(grupos, { id: childrem.grupoId }) || {}

                        if (childrem.grupo.grupoPaiId)
                            childrem.grupo.grupoPai = _.find(grupos, { id: childrem.grupoId }) || {} //mapChildrens(childrem.grupo.grupoPai)
                    }

                    return childrem

                })
            }
            /*
            if(utils.ObjectUtil.getValueProperty(item, 'grupoPai.childrens')){
                item.grupoPai = mapChildrens(item.grupoPai)
            }*/

        // return item
        //}

        /*
        
                _.map(grupos, item => {
                    mapChildrens(item)
                })*/



        /*
        grupos.forEach(item => {
            if(item.id == 13)
                console.log(item.childrens[0].grupoPai)
        })

*/
        /*
        console.log('okkkk')
        grupos = _.map(grupos, grupo => {
            if (grupo.grupoEcommerceId) {
                let grupoEcommerce = _.find(gruposEcommerce, { id: grupo.grupoEcommerceId })

                if (grupoEcommerce)
                    grupo.grupoEcommerce = grupoEcommerce

            }

            if (grupo.grupoPai) {
                let grupoEcommercePai = _.find(gruposEcommerce, { id: grupo.grupoPai.grupoEcommerceId })

                if (grupoEcommercePai)
                    grupo.grupoPai.grupoEcommerce = grupoEcommercePai
            }


            return grupo
        })

        let refTeste = (item) => {

            tem.grupo = _.find(grupos, { id: item.grupoId })

            if (item.grupo.childrens) {

                item.grupo.childrens = _.map(item.grupo.childrens, childrem => {

                    let itemEcommerce = _.clone(_.find(gruposEcommerce, { grupoId: childrem.id }))


                    if (itemEcommerce) {

                        childrem = _.clone(itemEcommerce)

                        childrem.grupo = _.clone(_.find(grupos, { id: childrem.grupoId })) || {}

                        if (childrem.grupo.grupoPaiId)
                            childrem.grupo.grupoPai = refTeste(item.grupo.grupoPai) //_.clone(_.find(grupos, { id: childrem.grupo.grupoPaiId }))
                    }

                    return childrem
                })
            }

            if (item.grupo.grupoPai.childrens) {

                item.grupo.grupoPai.childrens = _.clone(_.find(grupos, { id: item.grupo.grupoPai.id }))

                item.grupo.grupoPai.childrens = _.map(item.grupo.grupoPai.childrens, childrem => {

                    let itemEcommerce = _.clone(_.find(gruposEcommerce, { grupoId: childrem.id }))

                    if (itemEcommerce) {

                        childrem = _.clone(itemEcommerce)          

                        childrem.grupo = _.clone(_.find(grupos, {id: childrem.grupoId})) || {}

                        childrem.grupoEcommerce = itemEcommerce

                        if(childrem.grupo.grupoPaiId)
                            childrem.grupo.grupoPai = _.clone(_.find(grupos, {id: childrem.grupo.grupoPaiId}))
                    }

                    return childrem
                })

            }

            return item
        }
        */
        /*

        _.map(gruposEcommerce, item => {
            item.grupo = _.find(grupos, { id: item.grupoId })

            if (item.grupo.childrens) {

                item.grupo.childrens = _.map(item.grupo.childrens, childrem => {

                    let itemEcommerce = _.find(gruposEcommerce, { grupoId: childrem.id })


                    if (itemEcommerce) {



                        childrem = itemEcommerce

                        childrem.grupo = _.find(grupos, { id: childrem.grupoId }) || {}
                        if (childrem.grupo.grupoPaiId)
                            childrem.grupo.grupoPai = _.find(grupos, { id: childrem.grupo.grupoPaiId })
                    }

                    return childrem
                })
            }

            if (utils.ObjectUtil.getValueProperty(item, 'grupo.grupoPai.id')) {



                item.grupo.grupoPai = _.find(grupos, { id: item.grupo.grupoPai.id })

                item.grupo.grupoPai.childrens = _.map(item.grupo.grupoPai.childrens, childrem => {

                    let itemEcommerce = _.find(gruposEcommerce, { grupoId: childrem.id })

                    if (itemEcommerce) {

                        childrem = itemEcommerce          

                        childrem.grupo = _.find(grupos, {id: childrem.grupoId}) || {}

                        //childrem.grupoEcommerce = itemEcommerce

                        if(childrem.grupo.grupoPaiId)
                            childrem.grupo.grupoPai = _.clone(_.find(grupos, {id: childrem.grupo.grupoPaiId}))
                    }

                    return childrem
                })

            }


            return item
        })*/



        //return  circularJson.parse(circularJson.stringify(gruposEcommerce))
    }


    async findAll(conditions = {}) {

        let where = {
            include: [{ all: true, nested: true }],
            where: conditions
        }

        return await this._model.findAll(where)


    }

}


module.exports = GrupoEcommerceModel