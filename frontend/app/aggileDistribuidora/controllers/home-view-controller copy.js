const utils = require('../../../helpers/utils-site')



class HomeModel extends Backbone.Model {

    constructor() {
        super()
    }

    listCategorias(){
        return [
            {titulo : 'Bebidas Quentes', url: 'bebidas-quentes'},
            {titulo : 'Vinhos', url: 'vinhos'},
            {titulo : 'Espumantes', url: 'espumantes'},
            {titulo : 'Sucos', url: 'sucos'},
            {titulo : 'Vinagres', url: 'vinagres'},
            {titulo : 'Cosméticos', url: 'cosmeticos'},
        ]
    }

    urlSender(value) {
        return `/${value || ''}`
    }
}

class HomeView extends Backbone.View {

    constructor() {
        super()

        this._model = new HomeModel()

        this.$el = $('body')

        this.overrideEvents()
        this.render()
    }

    overrideEvents() {
        this.delegateEvents({
            "click .btn-atualizar-dados": "refreshBloco"
        });

    }


    render() {
        
        utils.UnderscoreUtil._template('#home-body-nav', {}, '#inner-content')
        utils.JqueryUtil.scroll()
        utils.JqueryUtil.rodapeBaseSite()
        return this
    }

}

module.exports.HomeView = () => {
    return new HomeView()
} 

