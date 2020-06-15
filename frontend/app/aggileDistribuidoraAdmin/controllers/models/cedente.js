let utils = require('../../../../helpers/utils-admin')

module.exports = class CedenteModel extends utils.BackboneModelUtil {

    constructor() {
        super()


    }

    defaults() {

    }


    model(form) {
        return utils.FormUtil.mapObject(form)
    }

    async listTiposEstabelecimento() {

        return await utils.ApiUtil.tiposEstabelecimentoEnum()
    }

    async save(data) {
        this.url = utils.UrlUtil.url(`admin/cedentes/save`)

        let send = { data: this.model(data).formObject, type: 'POST' }

        return await this.fetch(send)
    }

    async listAll(data = {}) {


        _.assign(data, this._paginator)

        this.url = utils.UrlUtil.url(`admin/cedentes/list`)

        let send = { type: 'POST', data: data }

        let retorno = await this.fetch(send)

        if (retorno && (retorno.length))
            this.paginatorCalcule()



        return retorno
    }
}