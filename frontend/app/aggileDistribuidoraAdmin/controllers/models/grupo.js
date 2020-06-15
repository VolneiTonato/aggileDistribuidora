let utils = require('../../../../helpers/utils-admin')

module.exports = class GrupoModel extends utils.BackboneModelUtil {

    constructor() {
        super()
    }

    defaults() {

    }


    model(form) {
        return utils.FormUtil.mapObject(form)
    }

    async save(data, isForm = true) {
        this.url = utils.UrlUtil.url(`admin/grupos/save`)

        //let send = { data: this.model(data).formObject, type: 'POST' }
        let send = { data: isForm == true ? this.model(data).formObject : data, type: 'POST', table: 'grupos', operacao: 'save' }

        return await this.fetch(send)
    }


    async clearGrupoEcommerce(){
        this.url = utils.UrlUtil.url(`admin/grupos/clear-ecommerce`)

        return await this.fetch({type: 'POST', data: {clear: true}})
    }


    async saveToEcommerce(data, isForm = true) {
        this.url = utils.UrlUtil.url(`admin/grupos/save-ecommerce`)


        let send = { data: isForm == true ? this.model(data).formObject : data, type: 'POST', cache: false }

        return await this.fetch(send)
    }

    async listGruposPais() {

        this.url = utils.UrlUtil.url(`admin/grupos/list-grupos-pais`)

        let send = { type: 'POST' }

        return await this.fetch(send)
    }

    async listAll(data = {}) {

        _.assign(data, this._paginator)

        this.url = utils.UrlUtil.url(`admin/grupos/list`)

        let send = { type: 'POST', data: data }

        let retorno = await this.fetch(send)

        if (retorno && (retorno.length > 0))
            this.paginatorCalcule()


        return retorno
    }
}

