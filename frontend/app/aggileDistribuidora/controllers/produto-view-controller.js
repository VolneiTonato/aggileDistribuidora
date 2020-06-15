const utils = require('../../../helpers/utils-site')


let _pesq = {
    tipo: null
}

let _cache = {
    produtos: []
}

class ProdutoModel extends Backbone.Model {

    constructor() {
        super()

    }



    carregarProdutos(tipo) {


        let deferred = $.Deferred()

        this.url = utils.UrlUtil.url(`public/imagens/aggile-distribuidora/data-images-${tipo}.json`)

        _pesq.tipo = tipo

        this.fetch().then(function (r) {

            if (utils.localStorageUtil.isLocalStorate())
                utils.localStorageUtil.setStorage(`produtos_site_${tipo}`, r)

            _cache.produtos[`${tipo}`] = r
            deferred.resolve(r)

            
        }).catch(function (err) {

            

            deferred.reject(err)
        })
        return deferred.promise()
    }




}

class ProdutoView extends Backbone.View {

    constructor(type, classificacao) {
        super()

        this._model = new ProdutoModel()

        this.$el = $('body')

        this._type = type


        this._classificacao = classificacao || null



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

            utils.JqueryUtil.rodapeBaseSite()

        } catch (err) {

        }
    }


    renderProdutos() {

        let promise = $.Deferred()


        if (utils.localStorageUtil.isLocalStorate() && (utils.localStorageUtil.isStorageItem(`produtos_site_${this._type}`))) {
            _cache.produtos[`${this._type}`] = utils.localStorageUtil.getStorage(`produtos_site_${this._type}`)
            promise.resolve(_cache.produtos[`${this._type}`])
            return promise.promise()
        }

        if (this._type && _cache.produtos[`${this._type}`]) {
            promise.resolve(_cache.produtos[`${this._type}`])
            return promise.promise()
        }


        this._model.carregarProdutos(this._type).then((data) => {
            promise.resolve(data)

        }).fail((err) => {
            promise.reject(err)
        })

        return promise.promise()
    }



    render() {

        utils.HtmlUtil.loader()

        this.renderProdutos().then((retorno) => {

            retorno.tipoProduto = this._type
            retorno.menuSelecionado = this._classificacao

            utils.UnderscoreUtil._template('#produtos-body-nav', retorno, '#inner-content')
            utils.UnderscoreUtil._template('#produtos-body-card-itens', retorno, '#inner-card-list-produtos')
            utils.JqueryUtil.rodapeBaseSite()

            utils.HtmlUtil.loaderLazy('.lazy', {
                bind: "event",
                delay: 0
            })
        })



        return this
    }

}

module.exports.ProdutoView = (type, classificacao) => {
    return new ProdutoView(type, classificacao)
}

