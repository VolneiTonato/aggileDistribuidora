let utils = require('../../../../helpers/utils-admin')

module.exports = class TipoUnidadeModel extends utils.BackboneModelUtil {

    constructor() {
        super()
    }
    
    model(form) {
        return utils.FormUtil.mapObject(form)
    }

    async save(data, isForm = true) {
        this.url = utils.UrlUtil.url(`admin/tipos-unidades/save`)

        let send = { data: isForm == true ? this.model(data).formObject : data, type: 'POST', table: 'tiposUnidade', operacao: 'save' }

        return await this.fetch(send)
    }

    async listAll(data = {}) {

        _.assign(data, this._paginator)

        this.url = utils.UrlUtil.url(`admin/tipos-unidades/list`)

        let send = { type: 'POST', data: data }

        let retorno = await this.fetch(send)

        if (retorno && (retorno.length > 0))
            this.paginatorCalcule()


        return retorno
    }
}

