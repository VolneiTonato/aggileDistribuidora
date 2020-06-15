const include = {
    indexedDbUtil: require('./indexed-db-utils')(),
    jsonUtil: require('./json-util')(),
    stringUtil: require('./string-util')(),
    objectUtil: require('./object-util')(),
    ModalUtil: require('./modal-util')(),
    PaginatorUtil: require('./paginator-util')()

}

class BackBoneModelAdminUtil extends Backbone.Model {

    constructor() {
        super()

        //this._url = this.url
        this._paginator = include.PaginatorUtil.paginator()
    }

    isOline() {
        try {
            return navigator.onLine
        } catch (err) {
            return false
        }


    }

    paginatorCalcule() {
        this._paginator = include.PaginatorUtil.calcularPaginator(this._paginator)
    }


    paginator() {
        return this._paginator
    }

    paginatorRefreshPesquisaPage() {
        this._paginator = include.PaginatorUtil.paginatorRefreshPage(this._paginator)
    }


    paginatorReset() {
        this._paginator = include.PaginatorUtil.paginator()
        return this._paginator
    }

    async fetch(param) {

        return new Promise(async (resolve, reject) => {
            let modal = await include.ModalUtil.loaderPage('Aguarde...')

            this.fetchIndexDB(param)
                .then((ok) => {
                    include.ModalUtil.forceCloseButton(modal.element)
                    resolve(ok)
                })
                .catch((err) => {
                    include.ModalUtil.forceCloseButton(modal.element)
                    reject(err)
                })

        })
    }

    async fetchIndexDB(param) {


        let promise = $.Deferred()

        _.assign(param, { cache: false })


        let saveIndexedDb = async (result) => {



            if (param.backup && param.offline == true)
                $.extend(true, param.backup, result)

            let cnn = await include.indexedDbUtil.conexao()

            let _data = _.clone(result)


            if (include.objectUtil.is(_data, 'id')) {

                let data = {}

                if (include.objectUtil.is(param.backup, 'id') && (param.backup.id != _data.id)) {
                    data = await cnn[param.table].get({ id: param.backup.id })
                    data.id = _data.id
                } else {
                    data = await cnn[param.table].get({ id: parseInt(_data.id) }) || {}
                }


                if (data && (data.idKey))
                    _data.idKey = data.idKey
            } else {
                _data.id = include.stringUtil.uuid()
            }

            /*
            if (!include.objectUtil.is(_data, 'uuid'))
                _data.uuid = include.stringUtil.uuid()
            else if(_data.uuid = 0)
                _data.uuid = include.stringUtil.uuid()
                */

            //if(!include.objectUtil.is(_data, 'syncServer') || param.offline == true)
            //    _data.syncServer = false

            await cnn[param.table].put(include.jsonUtil.toValuesIndexDb(_data))

            let query = {}

            if (_data.idKey)
                query = { idKey: _data.idKey }
            else
                query = { id: _data.id }

            return await cnn[param.table].get(query)

        }


        /*
        if (this.isOline() == false) {
            param.offline = true
            let result = await saveIndexedDb(param.data)
            promise.resolve({message: param.message, data : result})
        }*/

        super.fetch(param).then(async (result) => {

            if (param.operacao === 'save')
                await saveIndexedDb(result.data)


            promise.resolve(result)

        }).fail((err) => {

            promise.reject(err)

        })

        return promise.promise()


    }
}

/*
class BackboneRouterUtil extends Backbone.Router {
    constructor() {
        super()
    }

    route = (route, name, callback) => {

        let router = this

        if (!callback) callback = router[name]

        let f =  () => {
            callback.apply(router, arguments)
        }

        return Backbone.Router.prototype.route.call(router, route, name, f)
    }
}*/



module.exports = BackBoneModelAdminUtil