let utils = require('../../../helpers/utils-admin')


class HomeModel extends utils.BackboneModelUtil {

    constructor() { super() }


}

class HomeView extends Backbone.View {

    constructor() {
        super()

        this._model = new HomeModel()

        this._bread = new utils.BreadCrumb()
        this._bread.add('inicio', '#home')

        this.$el = $('body')

        _.bindAll(this, 'render')
        _.bindAll(this, 'overrideEvents')

        this.overrideEvents()

       
        this.render()
    }

    overrideEvents() {
        this.delegateEvents({
            "click .btn-atualizar-dados": "refreshBloco"
        });

    }


    async render() {
        this._bread.show()
        utils.UnderscoreUtil._template('#template-home', undefined, '#inner-content')

        if(utils.MobileUtil.isMobile() || utils.MobileUtil.isTablet()){
            let buttons = $('#inner-home').find('a.btn-app')

            buttons.addClass('btn-block')
            buttons.css({'margin-left':'0px'})

        }


        
        return this
    }

}

module.exports.HomeView = () => {
    return new HomeView()
}

