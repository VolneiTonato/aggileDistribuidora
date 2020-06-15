let utils = require('../../../../helpers/utils-admin')

class FinanceiroContaBancariaModel extends utils.BackboneModelUtil {

    constructor() {
        super()


    }

    defaults() {

    }


    model(form) {
        return utils.FormUtil.mapObject(form)
    }

    async save(data) {
        this.url = utils.UrlUtil.url(`admin/financeiro/contas-bancarias/save`)

        
        
        let send = { data: this.model(data).formObject, type: 'POST'}

        return await this.fetch(send)
    }

    async listAll(data = {}) {


        _.assign(data, this._paginator)

        this.url = utils.UrlUtil.url(`admin/financeiro/contas-bancarias/list`)

        let send = { type: 'POST', data: data }

        let retorno = await this.fetch(send)

        if (retorno && (retorno.length > 0)) 
            this.paginatorCalcule()
        
        

        return retorno
    }
}

module.exports = FinanceiroContaBancariaModel