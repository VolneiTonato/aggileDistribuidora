const utils = require('../../../../../../helpers/utils-admin')


module.exports = class CedenteListView extends Backbone.View{
    constructor(){
        super()

        this.$el = $('body')

        this.overrideEvents()

        process.nextTick(() => {
            this._model = new (require('../../../models/cedente'))(),
            this._formPesqObj = require('./cedente-form-pesquisa-view'),
            this._cedenteView = require('./cedente-view'),
            this.render()
        })

        
    }


    reset() {
        this.$el.off('click', '#block-list-cedente #btn-novo-cadastro')
        this.$el.off('click', '#block-list-cedente .btn-editar-cadastro')
        this.$el.off('click', '#block-list-cedente .carregar-mais')
    }

    overrideEvents() {
        this.reset()


        this.delegateEvents({
            "click #block-list-cedente #btn-novo-cadastro": "renderCadastro",
            "click #block-list-cedente .btn-editar-cadastro": "edit",
            'click #block-list-cedente .carregar-mais': 'carregarMaisItensCadastro'
        })
    }

    edit(e) {
        e.preventDefault()

        let data = utils.JsonUtil.toParse($(e.currentTarget).closest('.row-item-list').attr('data-item'))

        window.location.hash = "#cadastro-de-cedentes/edicao-cadastro-cedente"

        new this._cedenteView(data)
    }

    carregarMaisItensCadastro(e){
        e.preventDefault()

        $('#block-list-cedente .carregar-mais').attr({'disabled': true})

        this.getData({append : true})
    }


    getData(options = {}) {

        let overlay = $(`#block-list-cedente #overlay-painel-list-cadastro`).find('.overlay')

        let { form }  = options || {}

        overlay.show()

        this._model.listAll(form).then((r) => {

            this.renderData(r, options)

            overlay.hide()


        }).catch((err) => {
            utils.MessageUtil.error(err)
        })
    }

    renderData(data = {}, options = {}) {

        

        _.assign(options, { isDesktopMobile: true, closeLoader : true})


        utils.UnderscoreUtil._template('#template-list-table-cedentes-cadastrados', { cedentes: data }, '#inner-cedentes-cadastrados', options)

        if(data.length > 0)
            $('#block-list-cedente .carregar-mais').attr({'disabled': false})


        
    }


    callFormPesquisa(){

        utils.EventUtil.on('event.cadastro.pessoa.cedente.carregarCedenteByFormPesquisa', (param) => {

            
            
            this._model.paginatorReset()

            this.getData(param)
        })

        this._formPesqObj = new this._formPesqObj()


        utils.EventUtil.emit('event.cadastro.pessoa.cedente.carregarCedenteByFormPesquisa', {form :  this._formPesqObj.getFormPesquisaCache()} )

    }

    renderTela() {

        try {


            utils.UnderscoreUtil._template('#template-cadastro-cedente', {}, '#inner-content', {isLoader : true})

            utils.UnderscoreUtil._template('#template-children-cedente', {}, '#inner-content-children')

            utils.UnderscoreUtil._template('#template-children-cadastro-list-cedentes', {}, '#inner-content-children-cedente')
            

            this.callFormPesquisa()

            

        } catch (err) {
            utils.MessageUtil.error(err)
        }
    }


    render() {
        try {

            utils.HtmlUtil.loader()

            this.renderTela()

            this.getData()

            

        } catch (err) {
            utils.MessageUtil.message(err, 'danger')
        }
        return this
    }


}