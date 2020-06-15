let utils = require('../../../../../../helpers/utils-admin')
let async = require('async')

let GrupoModel = require('../../../models/grupo')

class GrupoRepasseEcommerceView extends Backbone.View {

    constructor() {
        super()

        this._bread = new utils.BreadCrumb()

        this.breadCrumbs()

        this._pathUrl = Backbone.history.getFragment()

        this._model = new GrupoModel()


        this.$el = $('body')

        this.overrideEvents()

        this.render()
    }

    breadCrumbs() {
        this._bread.add('inicio', '#home')
            .add('Grupos', '#cadastro-de-grupos')
    }

    reset() {
        this.$el.off('click', '#block-list-grupo-repasse-ecommerce .carregar-mais')
        this.$el.off('change', '#block-list-grupo-repasse-ecommerce .ordem-menu-ecommerce')
        this.$el.off('click', '#block-list-grupo-repasse-ecommerce .btn-mais-opcoes')
        this.$el.off('click', '#block-list-grupo-repasse-ecommerce-form-outros-campos .save')
        this.$el.off('click', '#block-list-grupo-repasse-ecommerce .salvar-geral')
        this.$el.off('change', '#block-list-grupo-repasse-ecommerce .is-principal-menu-ecommerce')
        this.$el.off('change', '#block-list-grupo-repasse-ecommerce .is-ecommerce')
    }


    overrideEvents() {
        this.reset()


        this.delegateEvents({
            'click #block-list-grupo-repasse-ecommerce .carregar-mais': 'carregarMaisItensCadastro',
            'change #block-list-grupo-repasse-ecommerce .ordem-menu-ecommerce': 'changeOrdem',
            'click #block-list-grupo-repasse-ecommerce .btn-mais-opcoes': 'maisCamposEdit',
            'click #block-list-grupo-repasse-ecommerce-form-outros-campos .save': 'saveItemMemory',
            'click #block-list-grupo-repasse-ecommerce .salvar-geral': 'saveAllAltered',
            'change #block-list-grupo-repasse-ecommerce .is-principal-menu-ecommerce': 'changeOrdemToOptionsGrupo',
            'change #block-list-grupo-repasse-ecommerce .is-ecommerce': 'changeOrdemToOptionsGrupo'
        })

    }

    changeOrdemToOptionsGrupo(e) {
        e.preventDefault()

        let currentElement = $(e.currentTarget).closest('.row-item-list')
        let currentItem = utils.JsonUtil.toParse($(currentElement).attr('data-item'))

        let elements = $(`#block-list-grupo-repasse-ecommerce .row-item-${currentItem.id}`)

        elements.each((i, element) => {

            $(element).find('.ordem-menu-ecommerce').val(0)
            let item = utils.JsonUtil.toParse($(element).attr('data-item'))
            item.grupoEcommerce.ordemMenuEcommerce = 0
            $(element).attr('data-item', utils.JsonUtil.toString(item))
        })


    }

    changeOrdem(e) {
        e.preventDefault()



        let value = $(e.currentTarget).val()




        if (value == 0)
            return true



        let currentElement = $(e.currentTarget).closest('.row-item-list')
        let currentItem = utils.JsonUtil.toParse($(currentElement).attr('data-item'))

        let isAlert = false

        let elementGrupo = $('#block-list-grupo-repasse-ecommerce .row-item-list')

        let ids = []
        elementGrupo.each((i, element) => {
            let item = utils.JsonUtil.toParse($(element).attr('data-item'))
            if ($(element).find('.ordem-menu-ecommerce').val() > 0)
                ids.push({ value: parseInt($(element).find('.ordem-menu-ecommerce').val()), id: item.id })
        })


        let mensagemSistema = async item => {
            if (isAlert)
                return false

            isAlert = true

            $(e.currentTarget).val(0)
            utils.MessageUtil.alert(`Já existe a ordem de nº ${value} para o item ${item.descricao}`, 'warning')
            return false
        }


        $(elementGrupo).each(async (i, block) => {


            let item = utils.JsonUtil.toParse($(block).attr('data-item'))

            if (item.id !== currentItem.id && $(block).find('.ordem-menu-ecommerce').val() > 0) {

                let current = _.find(ids, { id: item.id })

                if (current && (current.value == value))
                    return await mensagemSistema(item)

                else if (utils.ObjectUtil.getValueProperty(item, 'grupoEcommerce.ordemMenuEcommerce') == value)
                    return await mensagemSistema(item)
            }
        })

        let elements = $(`#block-list-grupo-repasse-ecommerce .row-item-${currentItem.id}`)

        elements.each((i, element) => {

            $(element).find('.ordem-menu-ecommerce').val(value)
            let item = utils.JsonUtil.toParse($(element).attr('data-item'))
            item.grupoEcommerce.ordemMenuEcommerce = value
            $(element).attr('data-item', utils.JsonUtil.toString(item))
        })


    }

    async saveItemMemory(e) {
        e.preventDefault()

        let data = utils.FormUtil.mapObject($(e.currentTarget).closest('#block-list-grupo-repasse-ecommerce-form-outros-campos')).formObject

        let block = $(`body #block-list-grupo-repasse-ecommerce .row-item-${data.id}`)



        let element = utils.JsonUtil.toParse($(block).attr('data-item'))

        $.extend(true, element, data)

        $(block).attr('data-item', utils.JsonUtil.toString(element))

        $(block).attr("altered", true)


        utils.ModalUtil.forceCloseButton(`${this._modalElement}`)

        return await utils.MessageUtil.alert('Grupo Ecommerce atualizado com sucesso!', 'info')



    }


    async saveAllAltered(e) {
        e.preventDefault()


        let type = '#inner-grupos-cadastrados-desktop'

        if ($(e.currentTarget).hasClass('btn-is-mobile'))
            type = '#inner-grupos-cadastrados-mobile'


        let itens = []

        let fields = ['isEcommerce', 'isPrincipalMenuEcommerce', 'ordemMenuEcommerce']


        $(`#block-list-grupo-repasse-ecommerce ${type} .row-item-list`).each((i, item) => {
            let data = utils.JsonUtil.toParse($(item).attr('data-item'))
            let formData = utils.FormUtil.mapObject($(item)).formObject

            let isAltered = false




            fields.forEach(item => {


                if (!data.grupoEcommerce)
                    data.grupoEcommerce = {}

                if (!utils.ObjectUtil.is(data.grupoEcommerce, item)) {
                    isAltered = true
                    data.grupoEcommerce[item] = formData.grupoEcommerce[item]

                } else if (data.grupoEcommerce[item] != formData.grupoEcommerce[item]) {
                    isAltered = true
                    data.grupoEcommerce[item] = formData.grupoEcommerce[item]
                }
            })

            if (isAltered) {
                $(`#block-list-grupo-repasse-ecommerce .row-item-${data.id}`).attr('data-item', utils.JsonUtil.toString(data))
                $(item).attr('altered', true)
            }


            let idx = _.findIndex(itens, { id: data.id })

            if (idx == -1)
                itens.push(data)
        })



        if (itens.length > 0) {

            
            let [err, ok] = await utils.PromiseUtil.to(this._model.clearGrupoEcommerce())

            if (err)
                return await utils.MessageUtil.error(err)

            


            async.forEachSeries(itens, (item, next) => {

                this._model.saveToEcommerce(item, false)
                    .then(ok => next(null))
                    .catch(err => next(err))

            }, async (err) => {
                if (err){
                    return await utils.MessageUtil.error(err)
                }else{

                    this._model.paginatorRefreshPesquisaPage()

                    this.render()
                    
                    return await utils.MessageUtil.alert('Grupo(s) salvo com sucesso!', 'success')
                }
            })

        }
    }


    async maisCamposEdit(e) {
        e.preventDefault()

        let data = utils.JsonUtil.toParse($(e.currentTarget).closest('.row-item-list').attr('data-item'))

        let html = await utils.UnderscoreUtil._template("#template-form-outros-campos-grupo-ecommerce", { form: data })


        let modal = await utils.ModalUtil.modalVTT(html, `Integração Ecommerce`, { buttonClose: true })

        this._modalElement = modal.element

        $(modal.element).dialog(modal.config).dialog('open')


    }


    carregarMaisItensCadastro(e) {
        e.preventDefault()

        $('#block-list-grupo-repasse-ecommerce .carregar-mais').attr({ 'disabled': true })

        this.carregarGrupos({ append: true })
    }

    carregarGrupos(options = {}) {

        let overlay = $(`#block-list-grupo-repasse-ecommerce #overlay-painel-list-cadastro`).find('.overlay')

        overlay.show()

        this._model.listAll().then((r) => {

            this.renderGrupo(r, options)

            overlay.hide()


        }).catch((err) => {
            utils.MessageUtil.error(err)
        })
    }

    async renderGrupo(data = {}, options = {}) {

        _.assign(options, { isDesktopMobile: true, closeLoader: true })

        await utils.UnderscoreUtil._template('#template-list-table-grupos-cadastrados-repasse-ecommerce', { grupos: data }, '#inner-grupos-cadastrados', options)

        let optionVazio = '<option value="">Selecione...</option>'



        data.forEach(item => {

            try {
                let element = $('#block-list-grupo-repasse-ecommerce').find(`.row-item-${item.id}`)

                let elementsControl = {
                    isEcommerce: '', isMenuPrincipal: '', ordem: ''
                }

                utils.ApiUtil.listBooleanSimNao().forEach(item => {
                    elementsControl.isMenuPrincipal += `<option value="${item.value}" ${item.value == false ? 'selected' : ''}>${item.text}</option>`
                    elementsControl.isEcommerce += `<option value="${item.value}" ${item.value == false ? 'selected' : ''}>${item.text}</option>`
                })

                for (let i = 0; i < 7; i++)
                    elementsControl.ordem += `<option value="${i}" ${item.value == 0 ? 'selected' : ''}>${i}</option>`

                $(element).find('select.is-principal-menu-ecommerce')
                    .html(elementsControl.isMenuPrincipal)
                    .find(`option[value="${utils.ObjectUtil.getValueProperty(item, 'grupoEcommerce.isPrincipalMenuEcommerce')}"]`).prop('selected', true)

                $(element).find('select.is-ecommerce')
                    .html(elementsControl.isEcommerce)
                    .find(`option[value="${utils.ObjectUtil.getValueProperty(item, 'grupoEcommerce.isEcommerce')}"]`).prop('selected', true)

                $(element).find('select.ordem-menu-ecommerce')
                    .html(elementsControl.ordem)
                    .find(`option[value="${utils.ObjectUtil.getValueProperty(item, 'grupoEcommerce.ordemMenuEcommerce')}"]`).prop('selected', true)

                //$(element).find(`.is-ecommerce option[value="${utils.ObjectUtil.getValueProperty(item,'grupoEcommerce.isEcommerce')}"]`).prop('selected', true)
                //$(element).find(`.ordem-menu-ecommerce option[value="${utils.ObjectUtil.getValueProperty(item,'grupoEcommerce.ordemMenuEcommerce')}"]`).prop('selected', true)
                //$(element).find(`.is-principal-menu-ecommerce option[value="${utils.ObjectUtil.getValueProperty(item,'grupoEcommerce.isPrincipalMenuEcommerce')}"]`).prop('selected', true)

            } catch (err) {

            }

        })

        if (data.length > 0)
            $('#block-list-grupo-repasse-ecommerce .carregar-mais').attr({ 'disabled': false })
    }


    renderTela() {

        try {


            utils.UnderscoreUtil._template('#template-cadastro-grupo', {}, '#inner-content', { isLoader: true })

            utils.UnderscoreUtil._template('#template-children-grupo', {}, '#inner-content-children')

            utils.UnderscoreUtil._template('#template-children-cadastro-list-grupos-repasse-ecommerce', {}, '#inner-content-children-grupo')

        } catch (err) {
            utils.MessageUtil.error(err)
        }
    }


    render() {
        try {

            utils.HtmlUtil.loader()

            this.renderTela()

            this.carregarGrupos()

        } catch (err) {
            utils.MessageUtil.message(err, 'danger')
        }
        return this
    }


}


module.exports = GrupoRepasseEcommerceView