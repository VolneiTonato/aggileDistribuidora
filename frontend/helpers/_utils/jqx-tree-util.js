const include = {
    indexedDbUtil: require('./indexed-db-utils')(),
    async: require('async')
}


class JQXTreeUtil {


    static async comboBoxGruposTreeView(parentId = null, increment = 0, grupoPaiSelected = null, options = {}) {

        let deferred = $.Deferred()


        include.async.waterfall([

            async (done) => {

                let data = []

                let grupos = []

                try {

                    let cnn = await include.indexedDbUtil.conexao()

                    if (parentId == null)
                        grupos = await cnn.grupos.where('grupoPaiId').equals('null').toArray()
                    else
                        grupos = await cnn.grupos.where('grupoPaiId').equals(parseInt(parentId)).toArray()


                    done(null, { data: data, grupos: grupos })

                } catch (err) {
                    done(err)
                }

            },

            (param, done) => {

                include.async.eachSeries(param.grupos, (item, next) => {

                    parentId = item.id
                    increment++


                    this.comboBoxGruposTreeView(parentId, increment, grupoPaiSelected, options).then((childrens) => {


                        let state = {}

                        if (!options.isNotSelectededItem)

                            if (item.id == grupoPaiSelected && grupoPaiSelected !== null)
                                state = { opened: true, selected: true }


                        param.data.push({
                            'id': item.id,
                            'text': item.descricao,
                            'state': state,
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
                deferred.reject(err)
            else
                deferred.resolve(success.data)
        })


        return deferred.promise()
    }
}

module.exports = () => { return JQXTreeUtil }

