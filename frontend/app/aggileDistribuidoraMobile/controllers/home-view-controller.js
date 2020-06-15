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
            
        });

    }


    async render() {
        this._bread.show()

        //let html = await utils.UnderscoreUtil._template('#template-teste', {form : {}})

        return this
    }

}

module.exports.HomeView = () => {
    return new HomeView()
}

