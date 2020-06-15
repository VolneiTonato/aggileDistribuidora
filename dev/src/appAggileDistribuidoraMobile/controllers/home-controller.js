const interfaces = [
    { name: 'consultaPreco', templateId: '#template-mobile-consulta-preco', href: '#', titulo: 'Consulta Preco' }
]



class HomeController {
    constructor(app){
        this._app = app

        this._router = require('express').Router()

        this._pathView = `${__dirname}/../views`

        this.registerRouters()
        
    }

    router(){
        return this._router
    }

    registerRouters(){

        this._router.get('/', (req, res, next) => {
            return res.render(`${this._pathView}/home/index.pug`, {interfaces : interfaces})
        })


    }

}


module.exports = (app) => { return new HomeController(app).router() }


