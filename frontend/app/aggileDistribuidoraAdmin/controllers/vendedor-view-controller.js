let utils = require('../../../helpers/utils-admin')



let paginator = utils.PaginatorUtil.paginator()



class VendedorModel extends utils.BackboneModelUtil {

    constructor() {
        super()


    }

    defaults() {

    }


    model(form) {
        return utils.FormUtil.mapObject(form)
    }


    async save(data) {
        this.url = utils.UrlUtil.url(`admin/vendedores/save`)
        
        let send = { data: this.model(data).formObject, type: 'POST'}

        return await this.fetch(send)
    }

    async listAll(data = {}) {


        _.assign(data, paginator)

        this.url = utils.UrlUtil.url(`admin/vendedores/list`)

        let send = { type: 'POST', data: data }

        let retorno = await this.fetch(send)

        if (retorno && (retorno.length > 0)) 
            paginator = utils.PaginatorUtil.calcularPaginator(paginator)
        
        

        return retorno
    }
}




class VendedorListView extends Backbone.View{
    constructor(){
        super()

        this._model = new VendedorModel()

        paginator = utils.PaginatorUtil.paginator()

        this.$el = $('body')

        this.overrideEvents()

        this.render()
    }


    reset() {
        this.$el.off('click', '#block-list-vendedor #btn-novo-cadastro')
        this.$el.off('click', '#block-list-vendedor .btn-editar-cadastro')
        this.$el.off('click', '#block-list-vendedor .carregar-mais')
        this.$el.off('click', '#block-list-vendedor .pesquisar')
        this.$el.off('click', '#block-list-vendedor .limpar-pesquisa')
    }

    overrideEvents() {
        this.reset()


        this.delegateEvents({
            "click #block-list-vendedor #btn-novo-cadastro": "renderCadastro",
            "click #block-list-vendedor .btn-editar-cadastro": "edit",
            'click #block-list-vendedor .carregar-mais': 'carregarMaisItensCadastro',
            'click #block-list-vendedor .pesquisar': 'pesquisarVendedor',
            'click #block-list-vendedor .limpar-pesquisa': 'limparPesquisaVendedor',
        })
    }

    edit(e) {
        e.preventDefault()

        let data = utils.JsonUtil.toParse($(e.currentTarget).closest('.row-item-list').attr('data-item'))

        window.location.hash = "#cadastro-de-vendedores/edicao-cadastro-vendedor"

        new VendedorView(data)
    }

    carregarMaisItensCadastro(e){
        e.preventDefault()

        $('#block-list-vendedor .carregar-mais').attr({'disabled': true})

        this.carregarVendedores({append : true})
    }


    getFormPesquisaCache() {
        let form = {}

        if (utils.localStorageUtil.isStorageItem('ultima_pesquisa_vendedores_cadastro'))
            form = utils.localStorageUtil.getStorage('ultima_pesquisa_vendedores_cadastro')

        return form
    }

    limparPesquisaVendedor(e) {
        e.preventDefault()
       

        utils.localStorageUtil.removeStorage('ultima_pesquisa_vendedores_cadastro')

        this.renderFormPesquisa({isClear : true})
    }

    pesquisarVendedor(e) {
        e.preventDefault()

        paginator = utils.PaginatorUtil.paginator()

        let form = utils.FormUtil.mapObject('#block-list-vendedor #form-pesquisa')


        utils.localStorageUtil.setStorage('ultima_pesquisa_vendedores_cadastro', form.formObject.pesquisa)



        this.carregarVendedores()

    }


    renderAutoCompleteVendedorFormPesquisa() {
        utils.UnderscoreUtil._template('#template-form-pesquisa-vendedores-autocomplete-vendedor', {}, '#inner-vendedor-autocomplete-pesquisa')

        utils.AutoCompleteUtil.AutoComplete({
            type:'vendedor',
            bloco: '#block-list-vendedor #bloco-autocomplete-vendedor',
            input: 'input[name="pesquisa_id"]',
            isClearValue: false,
            form: '#block-list-vendedor #form-pesquisa'
        })
    }


    

    renderFormPesquisa(options = {}) {

        let form = this.getFormPesquisaCache()


        utils.UnderscoreUtil._template("#template-form-pesquisa-vendedores", { form: form }, '#inner-form-pesquisa-vendedor')

        this.renderAutoCompleteVendedorFormPesquisa()


        $.when(utils.EstadoMunicipioUtil.municipioSelectBox(
            {
                municipioElement: '#block-list-vendedor #pesquisa-endereco-municipio-id',
                municipio: utils.ObjectUtil.getValueProperty(form, 'endereco.municipio.id')
            }
        ))
    }


    carregarVendedores(options = {}) {
        
        let form = this.getFormPesquisaCache()

        let overlay = $(`#block-list-vendedor #overlay-painel-list-cadastro`).find('.overlay')

        overlay.show()

        this._model.listAll(form).then((r) => {

            this.renderVendedores(r, options)

            overlay.hide()


        }).catch((err) => {
            utils.MessageUtil.error(err)
        })
    }

    renderVendedores(data = {}, options = {}) {

        

        _.assign(options, { isDesktopMobile: true, closeLoader : true})

        utils.UnderscoreUtil._template('#template-list-table-vendedores-cadastrados', { vendedores: data }, '#inner-vendedores-cadastrados', options)

        if(data.length > 0)
            $('#block-list-vendedor .carregar-mais').attr({'disabled': false})
    }

    renderTela() {

        try {


            utils.UnderscoreUtil._template('#template-cadastro-vendedor', {}, '#inner-content', {isLoader : true})

            utils.UnderscoreUtil._template('#template-children-vendedor', {}, '#inner-content-children')

            utils.UnderscoreUtil._template('#template-children-cadastro-list-vendedores', {}, '#inner-content-children-vendedor')

            this.renderFormPesquisa()

        } catch (err) {
            utils.MessageUtil.error(err)
        }
    }


    render() {
        try {

            utils.HtmlUtil.loader()

            this.renderTela()

            this.carregarVendedores()

        } catch (err) {
            utils.MessageUtil.message(err, 'danger')
        }
        return this
    }


}


class VendedorView extends Backbone.View {

    constructor(vendedor = {}) {
        super()

        this._bread = new utils.BreadCrumb()

        this.breadCrumbs()

        this._pathUrl = Backbone.history.getFragment()


        this._model = new VendedorModel()

        this.$el = $('body')

        this.overrideEvents()

        this.render(vendedor)
    }

    breadCrumbs() {
        this._bread.add('inicio', '#home')
            .add('Vendedores', '#cadastro-de-vendedores')
    }

    reset() {
        this.$el.off('click', '#block-form-vendedor #form-cadastro #save')
        this.$el.off('change', '#block-form-vendedor #form-cadastro #tipo-pessoa')
        this.$el.off('click', '#block-form-vendedor #btn-novo-cadastro')

    }


    overrideEvents() {
        this.reset()


        this.delegateEvents({
            "click #block-form-vendedor #form-cadastro #save": "save",
            "change #block-form-vendedor #form-cadastro #tipo-pessoa": 'tipoPessoa',
            'click #block-form-vendedor #btn-novo-cadastro': (e) => {
                e.preventDefault()
                new VendedorView()
            }
        })

    }


    tipoPessoa(e, data) {
        e.preventDefault()

        if (data) {
            if(utils.ObjectUtil.getValueProperty(data, 'vendedor.tipoPessoa') == 'F')
                $('#block-form-vendedor #form-cadastro').find('#tipoPessoaFisica').attr('selected', true)
            else
                $('#block-form-vendedor #form-cadastro').find('#tipoPessoaJuridica').attr('selected', true)
        }


        let value = $('#block-form-vendedor #form-cadastro').find('#tipo-pessoa option').filter(':selected').val()

        if (value == 'F') {
            $('#block-form-vendedor #form-cadastro').find('#cnpj').val('').attr('name', 'cnpj')
            $('#block-form-vendedor #form-cadastro').find('#cpf').attr('name', 'vendedor_cnpjCpf')
            $('#block-form-vendedor #form-cadastro').find('#bloco-pessoa-juridica').hide()
            $('#block-form-vendedor #form-cadastro').find('#bloco-pessoa-fisica').show()

        } else {
            $('#block-form-vendedor #form-cadastro').find('#cpf').val('').attr('name', 'cpf')
            $('#block-form-vendedor #form-cadastro').find('#cnpj').attr('name', 'vendedor_cnpjCpf')
            $('#block-form-vendedor #form-cadastro').find('#bloco-pessoa-fisica').hide()
            $('#block-form-vendedor #form-cadastro').find('#bloco-pessoa-juridica').show()
        }


    }



    save(e) {
        e.preventDefault()

        this._model.save($('#block-form-vendedor #form-cadastro')).then((r) => {


            utils.MessageUtil.message(r.message, 'info', {
                buttons: {
                    'Fechar': async (event) => {
                        utils.MessageUtil.closeButton(event)

                        if(utils.ObjectUtil.hasProperty(r.data, 'newUser.login'))
                            await utils.MessageUtil.alert(`Atenção! anote as informaçẽs de login e senha!<br />Login: ${r.data.newUser.login}<br />Senha: ${r.data.newUser.passwordTextplain} `, 'danger')

                        let retorno = r.data.vendedor || r.data

                        this.renderCadastro(retorno)
                    }
                }
            })
        }).catch((err) => {
            utils.MessageUtil.error(err)
        })


    }


    async renderCadastro(data = {}) {

        try {
            
            this.breadCrumbs()

            utils.HtmlUtil.loader()

            if (data.id === undefined)
                this._bread.add('Novo Cadastro').show()
            else
                this._bread.add(`Edição de Cadastro ${data.id}`).show()

            let municipioSelecionado = ''

            try {
                municipioSelecionado = data.endereco.municipio.id
            } catch (err) {

            }


            utils.UnderscoreUtil._template('#template-cadastro-vendedor', {}, '#inner-content')
            utils.UnderscoreUtil._template('#template-children-cadastro-vendedores', { form: data }, '#inner-content-children')


            $('#block-form-vendedor #form-cadastro').find('#tipoPessoaFisica').trigger('change', { tipoPessoa: data.tipoPessoa })
            


            $.when(utils.EstadoMunicipioUtil.estadoMunicipioSelectBox({
                municipio: municipioSelecionado
            }))

            let blockTelefone = new utils.TelefoneUtil('#block-form-vendedor #form-cadastro','#inner-telefone-vendedor')

            if(data.telefones && (data.telefones.length > 0))
                await blockTelefone.addListaTelefones(data.telefones)
            else
                await blockTelefone.add()


            new utils.LocationUtil('#block-form-vendedor #form-cadastro')


            utils.JqueryUtil.initializeComponentesJquery()
            utils.MaskInputUtil.mask()


        } catch (err) {
            utils.MessageUtil.error(err)
        }
    }

    render(vendedor = {}) {
        try {

            utils.HtmlUtil.loader()

            this._bread.show()

            this.renderCadastro(vendedor)

        } catch (err) {
            utils.MessageUtil.message(err, 'danger')
        }
        return this
    }

}

module.exports =  {
    VendedorListView : () => { return new VendedorListView()},
    VendedorView : () => { return new VendedorView()}
} 