let router = require('./router')
let utils = require('../../helpers/utils-admin')

class MainView extends Backbone.View {

    constructor() {
        super()

        utils.UrlUtil.forceHTTPS()

        _.bindAll(this, 'render')

        this.initRouter()

        this.render()
    }

    initRouter() {

        try{
            Backbone.history.stop()
        }catch(err){

        }

        //let urlNav = window.location.hash.replace('#', '')

        let href = `report-${location.href.replace(/(http||https)(:\/\/)/, '').replace(`${location.host}/reports/`, '')}`

        let urlNav = ''
        
        window.location.hash = ''

        Backbone.history.start({
            root: '/reports'
        })

        if(href == '')
            urlNav = 'home'
        else
            urlNav = href

        let _router = new router()

        window._router = _router

        _router.navigate(urlNav, {replace: true, trigger: true })
        
    }

    render() {
        
        return this
    }
}


module.exports.AggileDistribuidoraReports = {
    MainView: new MainView()
}