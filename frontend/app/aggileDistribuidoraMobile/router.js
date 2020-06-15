const controller = require('./controllers')
const utils = require('../../helpers/utils-admin')

const closeMenuLeft = () => {
    if (utils.MobileUtil.isMobile())
        if ($(`body`).hasClass('sidebar-open'))
            $(`body`).removeClass('sidebar-open')

}

class Router extends Backbone.Router {
    routes() {
        return {
            'home': 'home'
        }
    }

  

    initialize(){
        
    }

    home() {
        closeMenuLeft()
        controller.HomeController.HomeView()
    }

}

module.exports = Router