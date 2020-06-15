const utils = require('../../helpers/utils-site')
const router = require('./router')

class MainView extends Backbone.View {

    constructor() {
        super()

        utils.UrlUtil.forceHTTPS()

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
            pushState:true,
            root: ''
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