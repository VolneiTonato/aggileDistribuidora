const controller = require('./controllers')
const utils = require('../../helpers/utils-site')

/*
const closeMenuTop = () => {
    if (utils.MobileUtil.isMobile() || utils.MobileUtil.isTablet()) {
        if (!$(`.btn-responsive-menu`).hasClass('collapsed')) {
            $(`.btn-responsive-menu`).addClass('collapsed')
            $('#navbarSupportedContent').removeClass('show')
        }
    }
}*/

const key = 'session_18_anos_aggile_distribuidora'

class Router extends Backbone.Router {
    routes() {
        return {
            "/": "home",
            "home": "home",
            //"produtos/:query": "produtos",
            //"produtos/:query/query1": "produtos",
            //"apresentacao/:query/:query1": "apresentacao"
        }
    }

    /*
    execute(callback, args) {
        args.pop()
        if (callback) callback.apply(this, args)
    }*/



    /*
    initialize() {

        
        let run = () => {
            let value = utils.SessionStorageUtil.getStorage(utils.StringUtil.base64Encode(key))

            if (utils.StringUtil.base64Decode(value) != 'true') {

                $("#basicExampleModal").on('show.bs.modal', () => {

                    $('#btn-nao-maior-18-anos').off("click")
                    $('#btn-maior-18-anos').off("click")

                    $('#btn-nao-maior-18-anos').on('click', () => {
                        alert('Desculpe, para acessar o site você precisa ter idade legal para consumir bebidas alcoólicas.')
                        $('#basicExampleModal').modal('dispose')
                        run()
                    })


                    $('#btn-maior-18-anos').on('click', () => {
                        utils.SessionStorageUtil.setStorage(utils.StringUtil.base64Encode(key), utils.StringUtil.base64Encode('true'))
                        $('#basicExampleModal').modal('hide')
                    })
                })

                $('#basicExampleModal').modal({ backdrop: false, keyboard: false, show: true })
            }

        }

        run()


    }*/

    home() {
        controller.HomeController.HomeView()
    }
    /*
    produtos(type, classificacao) {
        controller.ProdutoController.ProdutoView(type, classificacao)
    }

    apresentacao(type, apresentacao) {
        controller.ApresentacaoController.ApresentacaoView(type, apresentacao)
    }*/

}

module.exports = Router