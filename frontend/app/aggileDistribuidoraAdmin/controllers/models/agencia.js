let utils = require('../../../../helpers/utils-admin')

class FinanceiroAgenciaModel extends utils.BackboneModelUtil {

    constructor() {
        super()


    }

    defaults() {

    }


    model(form) {
        return utils.FormUtil.mapObject(form)
    }


    async save(data) {
        this.url = utils.UrlUtil.url(`admin/financeiro/agencias/save`)



        let send = { data: this.model(data).formObject, type: 'POST' }

        return await this.fetch(send)
    }

    async listAll(data = {}) {


        _.assign(data, this._paginator)

        this.url = utils.UrlUtil.url(`admin/financeiro/agencias/list`)

        let send = { type: 'POST', data: data }


        try {

            let retorno = await this.fetch(send)

            if (retorno.length)
                this.paginatorCalcule()



            return retorno

        } catch (err) {
            throw err
        }
    }
}

module.exports = FinanceiroAgenciaModel