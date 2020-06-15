let utils = require('../../../../helpers/utils-admin')



let paginator = utils.PaginatorUtil.paginator()


const _cache = {
    blockParant : '',
    options : {},
    enderecos : []
}



class EnderecoModel extends utils.BackboneModelUtil {

    constructor() {
        super()


    }

    defaults() {

    }


    model(form) {
        return utils.FormUtil.mapObject(form)
    }

    async listTiposEstabelecimento() {

        return await utils.ApiUtil.tiposEstabelecimentoEnum()
    }

    async save(data, isForm = true) {
        this.url = utils.UrlUtil.url(`admin/enderecos/save`)

        let send = { data: isForm == true ? this.model(data).formObject : data, type: 'POST' }


        return await this.fetch(send)
    }

    async listAll(data = {}) {


        if(utils.ObjectUtil.length(data) == 0)
            data.pessoaId = _cache.options.pessoaId


        _.assign(data, paginator)

        this.url = utils.UrlUtil.url(`admin/enderecos/list`)



        let send = { type: 'POST', data: data }

        let retorno = await this.fetch(send)

        if (retorno && (retorno.length > 0))
            paginator = utils.PaginatorUtil.calcularPaginator(paginator)



        return retorno
    }
}





class EnderecoView extends Backbone.View {

    constructor(endereco = {}) {
        super()

        this._bread = new utils.BreadCrumb()


        this._pathUrl = Backbone.history.getFragment()


        this._model = new EnderecoModel()

        this._options = _cache.options


        this.$el = $('body')

        //this.overrideEvents()

        this.render(endereco)
    }

    async renderTelaCadastro(endereco = {}) {


        let html = await utils.UnderscoreUtil._template('#template-cadastro-endereco', { form: endereco })


        let modal = await utils.ModalUtil.modalVTT(html, 'Cadastro de Endereço')

        let options = {
            buttons: {
                'Salvar': (e) => {

                    let ob = this._model.model('#form-cadastro-endereco').formObject


                    
                    let enderecoForm = {}
                    try{
                        enderecoForm = utils.JsonUtil.toParse($('#form-cadastro-endereco #row-item-endereco').attr('data-item'))
                    }catch(err){

                    }
                    

                    

                    ob.tipoPessoa = this._options.tipoPessoa
                    ob.pessoaId = this._options.pessoaId
                    ob.id = enderecoForm.id


                    this._model.save(ob, false)
                        .then(async (ok) => {
                            

                            let [err, enderecos] = await utils.PromiseUtil.to(this._model.listAll({pessoaId : this._options.pessoaId}))

                            utils.ModalUtil.forceCloseButton(modal.element)

                            if(err)
                                return utils.MessageUtil.error(err)

                            await utils.MessageUtil.alert(ok.message, 'info')
                            
                            _cache.enderecos = enderecos

                            new EnderecoListView()
                            
                        })
                        .catch((err) => {
                            utils.MessageUtil.error(err)
                        })

                },
                'Fechar': (e) => {
                    utils.ModalUtil.forceCloseButton(modal.element)
                }
            }
        }

        _.extend(modal.config, options)

        $(modal.element).dialog(modal.config).dialog('open')

        new utils.LocationUtil('#form-cadastro-endereco', 'latitudeLongitude')

        $.when(utils.EstadoMunicipioUtil.estadoMunicipioSelectBox({
            parentElement: '#form-cadastro-endereco',
            municipio: utils.ObjectUtil.getValueProperty(endereco, 'municipio.id')
        }))
    }



    render(endereco = {}) {

        this.renderTelaCadastro(endereco)

        return this
    }

}



class EnderecoListView extends Backbone.View {

    constructor() {
        super()

        this._model = new EnderecoModel()

        paginator = utils.PaginatorUtil.paginator()

        this.$el = $('body')

        this._blockParent = _cache.blockParant

        this._enderecos = _cache.enderecos || []


        this.overrideEvents()

        this.render()
    }


    reset() {
        this.$el.off('click', '#block-list-endereco #btn-novo-cadastro')
        this.$el.off('click', '#block-list-endereco .btn-editar-cadastro')
        this.$el.off('click', '#block-list-endereco .carregar-mais')
    }

    overrideEvents() {
        this.reset()


        this.delegateEvents({
            "click #block-list-endereco #btn-novo-cadastro": "renderCadastro",
            "click #block-list-endereco .btn-editar-cadastro": "edit",
            'click #block-list-endereco .carregar-mais': 'carregarMaisItensCadastro',
        })
    }

    renderCadastro(e) {
        e.preventDefault()

        new EnderecoView()
    }

    edit(e) {
        e.preventDefault()

        let data = utils.JsonUtil.toParse($(e.currentTarget).closest('.row-item-list').attr('data-item'))
   

        new EnderecoView(data)
    }

    carregarMaisItensCadastro(e) {
        e.preventDefault()

        $('#block-list-endereco .carregar-mais').attr({ 'disabled': true })

        this.carregarEnderecos({ append: true })
    }





    carregarEnderecos(options = {}) {

        let overlay = $(`#block-list-endereco #overlay-painel-list-cadastro`).find('.overlay')

        overlay.show()

        let enderecos = []

        if(this._enderecos.length > 0)
            enderecos = this._enderecos.filter(item => { return item.isPrincipal == false })

        

        overlay.hide()

        this.renderEnderecos(enderecos, options)


    }

    renderEnderecos(data = {}, options = {}) {

        _.assign(options, { isDesktopMobile: true, closeLoader: true })

        utils.UnderscoreUtil._template('#template-list-table-enderecos-cadastrados', { enderecos: data }, `#block-list-endereco #inner-enderecos-cadastrados`, options)

        if (data.length > 0)
            $('#block-list-endereco .carregar-mais').attr({ 'disabled': false })
    }

    async renderTela() {

        let [err, ok] = await utils.PromiseUtil.to(utils.UnderscoreUtil._template('#template-children-cadastro-list-enderecos', {}, this._blockParent))
        if (err)
            return utils.MessageUtil.error(err)
    }


    render() {

        try {

            utils.HtmlUtil.loader(undefined, undefined, this._blockParent)

            this.renderTela()

            this.carregarEnderecos()

        } catch (err) {
            utils.MessageUtil.message(err, 'danger')
        }
        return this
    }


}


module.exports = {
    EnderecoListVew: (blockParent, enderecos, options) => { 
        
        _cache.options = options
        _cache.blockParant = blockParent + ' #inner-content-children-endereco'
        _cache.enderecos = enderecos
        return new EnderecoListView() 
    }
}


