const utils = require('../../../helpers/utils-site')

let _pesq = {
    tipo: null
}

let _cache = {
    produtos: []
}


let _instance = null

class ApresentacaoModel extends Backbone.Model {

    constructor() {
        super()

    }


    carregarCatalogo(tipo, apresentacao) {


        let deferred = $.Deferred()

        this.url = utils.UrlUtil.url(`public/imagens/aggile-distribuidora/data-images-${tipo}-apresentacao.json`)

        

        _pesq.tipo = tipo

        this.fetch().then(function (r) {

            if (utils.localStorageUtil.isLocalStorate())
                utils.localStorageUtil.setStorage(`produtos_site_${tipo}_apresentacao`, r)

            _cache.produtos[`${tipo}`] = r
            deferred.resolve(r)

            
        }).catch(function (err) {

            

            deferred.reject(err)
        })
        return deferred.promise()
    }


}

class ApresentacaoView extends Backbone.View {

    constructor(type, apresentacao) {
        super()


        this._type = type

        this._typeApresentacao = apresentacao

        this._model = new ApresentacaoModel()

        this.$el = $('body')

       
        _.bindAll(this, 'overrideEvents')

        this.overrideEvents()



        _.bindAll(this, 'render')


        this.render()
    }

    reset(){
        this.$el.off('click', '[data-fancybox="no-image"]')
    }

    overrideEvents() {

        this.reset()
        
        this.delegateEvents({
            'click a.menu-produto': 'reloadRouter',
            'change select.menu-produto': 'reloadMobileRouter',
            'click [data-fancybox="no-image"]': 'modalImagem'
        })
    }


    modalImagem(e) {
        e.preventDefault()


        let link = $(e.currentTarget)

        if(link.attr('href') == '' || link.attr('href') == '#')
            return false
        else
            return true

    }

    reloadMobileRouter(e) {
        e.preventDefault()

        let select = $(e.currentTarget)

        let option = select.find('option').filter(':selected')

        select.find('option').filter('option[value=""]').remove()


        Backbone.history.loadUrl(option.attr('link'))


        $('.view-card-item').css({ 'display': 'none', 'opacity': '0.4' })

        $('.view-card-item').each(function (i, val) {

            if ($(this).attr('categoria-portifolio-galery') == option.val())
                $(this).css({ 'display': 'block' , 'opacity': '0.4' }).show().delay(500).animate({opacity: 1})
        })

    }


    reloadRouter(e) {
        e.preventDefault()


        try {

            let link = $(e.currentTarget)

            let altura = $('html').scrollTop()

            $('a.menu-produto').removeClass('active')

            $('.view-card-item').css({ 'display': 'none', 'opacity': '0.4' })



            $('.view-card-item').each(function (i, val) {

                if ($(this).attr('categoria-portifolio-galery') == link.attr('data-classificacao'))
                    $(this).css({ 'display': 'block', 'opacity': '0.4' }).show().delay(500).animate({opacity: 1})
            })


            link.addClass('active')

        } catch (err) {

        }
    }


    renderProdutos() {

        let promise = $.Deferred()


        if (utils.localStorageUtil.isLocalStorate() && (utils.localStorageUtil.isStorageItem(`produtos_site_${this._type}_apresentacao`))) {
            _cache.produtos[`${this._type}`] = utils.localStorageUtil.getStorage(`produtos_site_${this._type}_apresentacao`)
            promise.resolve(_cache.produtos[`${this._type}`])
            return promise.promise()
        }

        if (this._type && _cache.produtos[`${this._type}`]) {
            promise.resolve(_cache.produtos[`${this._type}`])
            return promise.promise()
        }


        this._model.carregarCatalogo(this._type, this._typeApresentacao).then((data) => {
            promise.resolve(data)

        }).fail((err) => {
            promise.reject(err)
        })

        return promise.promise()
    }




  



    render() {

        utils.HtmlUtil.loader()

        this.renderProdutos().then( (r) => {

            
            utils.UnderscoreUtil._template('#apresentacao-produtos-body', {catalogo : r, type: this._type, typeApresentacao : this._typeApresentacao }, '#inner-content')
            utils.JqueryUtil.rodapeBaseSite() 
            
            utils.HtmlUtil.loaderLazy('.lazy', {
                bind: "event",
                delay: 0
            })
        })

        return this
    }

}

module.exports.ApresentacaoView = (type, apresentacao) => {
    return new ApresentacaoView(type, apresentacao)
}

