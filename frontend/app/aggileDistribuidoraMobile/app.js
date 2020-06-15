const router = require('./router')
const utils = require('../../helpers/utils-admin')

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
        
        window.location.hash = ""

        Backbone.history.start({
            root: '/mobile'
        })

        let _router = new router()

        _router.navigate('home', {replace: true, trigger: true })

        utils.ServiceWorkerUtil.ServiceWorkerAll('mobile')
    }

    render() {
        return this
    }
}


module.exports.AggileDistribuidoraMobile = {
    MainView: new MainView()
}