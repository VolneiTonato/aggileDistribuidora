const router = require('./router')
const utils = require('../../helpers/utils-site')

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
            utils.ServiceWorkerUtil()
        }catch(err){
            
        }
        
        window.location.hash = ""

        Backbone.history.start({
            root: '/'
        })

        let _router = new router()

        window._router = _router

        _router.navigate('home', {replace: true, trigger: true })
    }

    render() {
        return this
    }
}


module.exports.AggileDistribuidoraWeb = {
    MainView: new MainView()
}