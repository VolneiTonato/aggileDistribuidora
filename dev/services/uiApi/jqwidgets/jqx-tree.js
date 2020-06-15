const aggileModel = require('../../../models/aggile-admin/aggileAdminModel')
const async = require('async')

class JQXTree {

    static comboBoxGruposTreeView(parentId = null, increment = 0, grupoPaiSelected = null, options = {}) {

        

        return new Promise((resolve, reject) => {

            async.waterfall([

                (done) => {

                    let data = []

                    new aggileModel.GrupoModel().findAllGrupoToParent(parentId).then((grupos) => {
                        done(null, { data: data, grupos: grupos })
                    }).catch((err) => {
                        done(err)
                    })

                },

                (param, done) => {

                    async.eachSeries(param.grupos, (item, next) => {

                        parentId = item.id
                        increment++


                        this.comboBoxGruposTreeView(parentId, increment, grupoPaiSelected, options).then((childrens) => {
                            /*
                            param.data.push({
                                'id': item.id,
                                'descricao': item.descricao,
                                'descricaoComEspaco': _.repeat('&nbsp;', increment * 3) + item.descricao,
                                'childrens': childrens
                            })*/

                            let state = {}

                            if(!options.isNotSelectededItem)

                                if(item.id == grupoPaiSelected && grupoPaiSelected !== null)
                                    state = {opened: true, selected : true}

                   
                            param.data.push({
                                'id': item.id,
                                'text': item.descricao,
                                'state' : state,
                                //'descricaoComEspaco': _.repeat('&nbsp;', increment * 3) + item.descricao,
                                'children': JSON.parse(JSON.stringify(childrens))
                            })

                            next(null)

                        }).catch((err) => {
                            next(err)
                        })

                    }, (err) => {
                        if (err)
                            done(err)
                        else
                            done(null, param)
                    })
                },
            ], (err, success) => {
                
                if (err)
                    return reject(err)
                return resolve(success.data)
            })

        })

    }
}

module.exports = JQXTree

