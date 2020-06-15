let router = require('./router')
let utils = require('../../helpers/utils-admin')


$(window).resize(function(e){
    e.preventDefault()
    

    if ($('body').find('a.btn-app').length > 0) {
        let buttons = $('body').find('a.btn-app')

        if (utils.MobileUtil.IsMobileOrTablet()) {
            buttons.addClass('btn-block')
            buttons.css({ 'margin-left': '0px' })
        } else {
            buttons.removeClass('btn-block')
            buttons.css({ 'margin-left': '15px' })
        }
    }
})

class MainView extends Backbone.View {

    constructor() {
        super()

        utils.UrlUtil.forceHTTPS()

        _.bindAll(this, 'render')

        this.initRouter()

        this.render()
    }

    initRouter() {

        try {
            Backbone.history.stop()
        } catch (err) {

        }

        let urlNav = window.location.hash.replace('#', '')

        window.location.hash = ''

        Backbone.history.start({
            root: '/admin'
        })

        if (urlNav == '')
            urlNav = 'home'

        let _router = new router()

        window._router = _router

        _router.navigate(urlNav, { replace: true, trigger: true })

    }

    render() {

        return this
    }
}


module.exports.AggileDistribuidoraAdmin = {
    MainView: new MainView()
}