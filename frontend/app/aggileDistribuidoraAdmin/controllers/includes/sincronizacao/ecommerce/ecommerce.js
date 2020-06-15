const EcommerceMaster = require('./ecommerce-master')
let utils = require('../../../../../../helpers/utils-admin')

class SincronizacaoModel extends utils.BackboneModelUtil{


    constructor(){
        super()
    }

    async sincronizacao(uri){

        this.url = utils.UrlUtil.url(`admin/importacao/sincronizacao-to-ecommerce-${uri}`)

        let send = {data: {}, type : 'POST'}
        
        return await this.fetch(send)
    }
}

class EcommerceSincronizacao extends Backbone.View {
    constructor() {

        super()

        this.$el = $('body')

        this._model = new SincronizacaoModel()

        this.overrideEvents()

        this.render()
    }

    reset() {
        this.$el.off('click', `#block-sincronizacao-ecommerce .btn-sync`)
    }


    overrideEvents() {
        this.reset()


        this.delegateEvents({
            'click #block-sincronizacao-ecommerce .btn-sync':'exec'
        })

    }

    async exec(e) {
        e.preventDefault()

        let [err, ok] = await utils.PromiseUtil.to(this._model.sincronizacao($(e.currentTarget).attr('url')))

        if(err)
            utils.MessageUtil.error(err)
        else
            utils.MessageUtil.alert('Operação realizada com sucesso!', 'success')
            
        
    }

    render(){

        utils.UnderscoreUtil._template('#template-sincronizacao', {}, '#inner-content', { isLoader: true })


        utils.UnderscoreUtil._template('#template-children-sincronizacao', {}, '#inner-content-children')

        
        utils.UnderscoreUtil._template('#template-children-sincronizacao-ecommerce', {}, '#inner-content-children-sincronizacao')

        return this
    }
}


module.exports = {
    EcommerceSincronizacao : EcommerceSincronizacao
}
