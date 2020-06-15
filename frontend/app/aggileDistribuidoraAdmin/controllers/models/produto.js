let utils = require('../../../../helpers/utils-admin')




module.exports  = class ProdutoModel extends utils.BackboneModelUtil {

    constructor() {
        super()

        this._paginator = utils.PaginatorUtil.paginator()


    }

    defaults() {

    }


    model(form) {
        return utils.FormUtil.mapObject(form)
    }

    async save(data, isForm = true) {
        this.url = utils.UrlUtil.url(`admin/produtos/save`)


        let send = { data: isForm == true ? this.model(data).formObject : data, type: 'POST', cache: false }

        return await this.fetch(send)
    }


    async saveToEcommerce(data, isForm = true) {
        this.url = utils.UrlUtil.url(`admin/produtos/save-ecommerce`)


        let send = { data: isForm == true ? this.model(data).formObject : data, type: 'POST', cache: false }

        return await this.fetch(send)
    }


    async listAll(data = {}) {

        _.assign(data, this._paginator)

        this.url = utils.UrlUtil.url(`admin/produtos/list`)

        let send = { type: 'POST', data: data }

        let retorno = await this.fetch(send)

        if (retorno && (retorno.length > 0)) 
            this.paginatorCalcule()
        

        return retorno
    }
}