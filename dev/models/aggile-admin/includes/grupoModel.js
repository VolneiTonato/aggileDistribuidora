const sequelize = require('./entityes/index')
const _ = require('lodash')
const utils = require('../../../helpers/_utils/utils')
const async = require('async')
const utilModel = require('../extras/utils-model')
const relation = require('./enuns/relation')

let conexao = sequelize.conexao


const overrideGrupo = (data = []) => {

    return new Promise((resolve, reject) => {

        async.waterfall([
            (done) => {


                let retorno = []

                if (data.length == 0) {
                    retorno.push(data)
                    done(null, retorno)
                } else {


                    async.eachSeries(data, (item, next) => {



                        if (utils.ObjectUtil.getValueProperty(item, 'grupoPaiId')) {



                            comboBoxGruposTreeView(item.grupoPaiId).then((r) => {


                                item.grupoPai = r.data[0]

                                item.atalho = _.reverse(r.breadCrumb.toString().split(',')).toString().replace(/,/g, ' -> ')


                                retorno.push(item)

                                next(null)

                            }).catch((err) => {

                                next(err)
                            })
                        } else {

                            item.atalho = ''
                            retorno.push(item)

                            next(null)
                        }


                    },
                        (err, success) => {
                            done(null, retorno)
                        })
                }
            }
        ], (err, success) => {
            if (err)
                return reject(err)



            if (_.isArray(success) && (success.length == 1))
                return resolve(success[0])
            return resolve(success)
        })
    })
}


const comboBoxGruposTreeView = (parentId = null, increment = 0, grupoPaiSelected = null, options = {}) => {



    return new Promise((resolve, reject) => {

        async.waterfall([

            async (done) => {

                let data = []
                let bread = []



                new GrupoModel()._model.findOne({ where: { id: parentId } })
                    .then((grupo) => {
                        done(null, { data: data, grupo: grupo, breadCrumb: bread, refParents: [] })
                    }).catch((err) => {
                        done(err)
                    })




            },

            (param, done) => {


                let item = param.grupo



                parentId = item.grupoPaiId
                increment++

                param.breadCrumb.push(item.descricao)

                if (parentId) {


                    comboBoxGruposTreeView(parentId, increment, grupoPaiSelected, options).then((children) => {

                        param.breadCrumb.push(children.breadCrumb)


                        item.grupoPai = children.data[0]
                        item.atalho = _.reverse(param.breadCrumb.toString().split(',')).toString().replace(/,/g, ' -> ')

                        param.data.push(item)


                        done(null, param)

                    }).catch((err) => {
                        done(err)
                    })
                } else {
                    param.data.push(item)
                    done(null, param)
                }

            },
        ], (err, success) => {

            if (err)
                return reject(err)
            return resolve(success)
        })

    })

}




class GrupoModel {

    constructor() {
        this._model = sequelize.entity.Grupo

        process.nextTick(() => {
            this._modelGrupoEcommerce = require('./grupoEcommerceModel')
        })

        this._include = {
            include: [
                { all: true, nested: true }
            ]
        }


    }


    async pesquisar(conditions = {}) {


        let query = {
            include: relation().RelationGrupo //this._include.include
        }

        if (utils.ObjectUtil.getValueProperty(conditions, 'paginator.limit'))
            query.limit = parseInt(conditions.paginator.limit)

        if (utils.ObjectUtil.getValueProperty(conditions, 'paginator.offset'))
            query.offset = parseInt(conditions.paginator.offset)

        return await this._model.findAll(query)

    }

    async saveToEcommece(data) {

        let grupo = await this._model.findOne({ where: { id: data.id } })

        if (!grupo)
            throw 'Grupo inválido!'

        return await conexao.transaction(async (transaction) => {

            let grupoEcommerce = await new this._modelGrupoEcommerce().saveToGrupo(data, { validate: true, transaction: transaction })

            grupo.grupoEcommerceId = grupoEcommerce.id

            await grupo.save({ validate: true, transaction: transaction })
        })
    }


    async clearToEcommece() {


        let grupos = await this._model.findAll()

        return await conexao.transaction(async (transaction) => {

            new this._modelGrupoEcommerce().removeAll(grupos, { validate: true, transaction: transaction })
                .then(ok => {
                    return true
                }).catch(err => {
                    throw err
                })

        })

    }

    async createOrUpdate(data = {}) {


        let grupo = {}

        let grupoUnique = await utilModel.CrudUtil.uniqueField(this._model, data.id, { descricao: data.descricao, grupoPaiId: { [sequelize.Op.eq]: data.grupoPaiId } })

        if (grupoUnique)
            throw 'Descrição já cadastrada!'

        data.grupoPaiId = utils.NumberUtil.filter(data.grupoPaiId)

        data.grupoPaiId = data.grupoPaiId == '' ? null : data.grupoPaiId

        if (data.id) {
            grupo = utilModel.LoadModelToFormUtil.load(new sequelize.entity.Grupo(), _.clone(data))

            let grupoExistente = await this._model.findOne({ where: { id: grupo.id } })

            if (!grupoExistente)
                throw 'grupo inválido'

            utilModel.LoadModelToFormUtil.loadChangeModel(grupoExistente, data)


            grupo = await grupoExistente.save({ validate: true })

        } else {
            grupo = await this._model.create(data)
        }


        await this.atualizarBreadCrumb()



        return await this.findOne(grupo.id)
    }

    async atualizarBreadCrumb() {



        let data = await this.findAll()

        let retorno = await this.overrideGrupo(data)

        return await Promise.all(retorno.map(async (o) => {
            o.breadCrumb = o.atalho
            await o.save()
        }))

    }


    async findAllGruposPais() {
        return await this._model.findAll()
    }


    async findOne(id) {
        return await this._model.findOne({
            where: { id: id },
            include: [{ all: true, nested: true }],
        })

    }


    async findAllMapGrupo(conditions = {}, options = {}) {

        let grupos = (await this.findAll(conditions)).map(el => el.get({ plain: true }))

        if (grupos.length == 0)
            return []

        let allGrupos = (await this._model.findAll()).map(el => el.get({ plain: true }))

        let mapAll = item => {
            if (item.grupoPaiId)
                item.grupoPai = _.clone(_.find(allGrupos, { id: item.grupoPaiId }))

            if (utils.ObjectUtil.getValueProperty(item, 'grupoPai.grupoPaiId'))
                item.grupoPai = _.clone(mapAll(item.grupoPai))

            return _.clone(item)
        }

        _.map(allGrupos, mapAll)
        _.map(allGrupos, mapAll)
        _.map(grupos, mapAll)

        /*

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

        cache = new Array()*/
        /*
        
        grupos = await new Promise((resolve, reject) => {

            

            async.waterfall([
                (done) => {
                    async.mapSeries(grupos, (item, next) => {
                        setTimeout(async () => {

                            item = await mapRecursiveGruposEcommerce(item)

                            next(null)

                        }, 500);
                    }, () => {
                        done(null)
                    })
                },

            ], (err, result) => {
                return resolve(grupos)
            })
        })*/


        let mapChildrem = grupo => {

            

            let childrens = _.filter(allGrupos, { grupoPaiId: grupo.id }) || []

            if (utils.ArrayUtil.length(childrens) > 0) {

                let results = childrens.map(item => {

                    if (options.isExportacaoEcommerce) {
                        return _.find(grupos, (op) => {
                                return op.id === item.id && op.grupoEcommerce.isEcommerce == true
                        })
                    } else {

                        return _.find(allGrupos, { id: item.id }) || {}

                    }
                })
                grupo.childrens =   _.filter(results)
            }

            return grupo
        }

        _.map(grupos, mapChildrem)

        let mapChildremPai = grupo => {

            if (grupo.grupoPaiId) {

                let childrens = _.filter(allGrupos, { grupoPaiId: grupo.grupoPaiId }) || []

                if (utils.ArrayUtil.length(childrens) > 0) {

                    let results = childrens.map(item => {



                        if (options.isExportacaoEcommerce) {

                            return _.find(grupos, (op) => {

                                return op.id === item.id && utils.ObjectUtil.getValueProperty(op, 'grupoEcommerce.isEcommerce') == true
                            })
                        } else {

                            return _.find(allGrupos, { id: item.id }) || {}

                        }
                    })


                    grupo.grupoPai.childrens = utils.JsonUtil.toReparseCircular(_.filter(results))


                }
            }

            return grupo
        }


        _.map(grupos, mapChildremPai)


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


    async findAll(conditions = {}) {
        let where = {
            include: [{ all: true, nested: true }],
            where: conditions
        }

        _.assign(where, this._include)

        return await this._model.findAll(where)
    }


    async findAllGrupoToParent(parentId = null) {
        if (parentId === null)
            return await this._model.findAll({ where: { grupoPaiId: null } })
        else
            return await this._model.findAll({ where: { grupoPaiId: parentId } })
    }




    async overrideGrupo(data = []) {
        return await overrideGrupo(data)
    }

}

module.exports = GrupoModel