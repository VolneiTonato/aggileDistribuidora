let utils = require('../../../../../helpers/utils-admin')
let produtoModel = require('../../models/produto')



module.exports = class ProdutoView extends Backbone.View {

    constructor(produto = {}) {
        super()

        this._bread = new utils.BreadCrumb()

        this.breadCrumbs()


        this._model = new produtoModel()

        this.$el = $('body')

        this.overrideEvents()

        this.render(produto)
    }

    breadCrumbs() {
        this._bread.add('inicio', '#home')
            .add('Produtos', '#cadastro-de-produtos')
    }

    reset() {
        this.$el.off('click', '#block-form-produto #form-cadastro #save')
        this.$el.off('focusout', '#block-form-produto #form-cadastro input[name="precoVenda"]')
        this.$el.off('focusout', '#block-form-produto #form-cadastro input[name="margemLucro"]')
        this.$el.off('focusout', '#block-form-produto #form-cadastro input[name="custo"]')
        this.$el.off('')
    }


    overrideEvents() {
        this.reset()


        this.delegateEvents({
            "click #block-form-produto #form-cadastro #save": "save",
            'focusout #block-form-produto #form-cadastro input[name="precoVenda"]': 'changeValores',
            'focusout #block-form-produto #form-cadastro input[name="margemLucro"]': 'changeValores',
            'focusout #block-form-produto #form-cadastro input[name="custo"]': 'changeValores',
            'click #block-form-produto #btn-novo-cadastro': (e) => {
                e.preventDefault()
                new ProdutoView()
            }
        })

    }

    changeValores(e) {
        let getName = $(e.currentTarget).attr('name')

        let form = utils.FormUtil.mapObject('#block-form-produto #form-cadastro')



        if (getName == 'precoVenda') {
            if (form.formObject.precoVenda > 0)
                form.formElement.margemLucro.val(utils.NumberUtil.calcularMargemLucro(form.formObject.custo, form.formObject.precoVenda))
            else if (form.formObject.margemLucro > 0)
                form.formElement.precoVenda.val(utils.NumberUtil.calcularPercentual(form.formObject.custo, form.formObject.margemLucro))
        } else if (getName == 'custo') {
            if (form.formObject.margemLucro > 0)
                form.formElement.precoVenda.val(utils.NumberUtil.calcularPercentual(form.formObject.custo, form.formObject.margemLucro))
            else if (form.formObject.precoVenda > 0)
                form.formElement.margemLucro.val(utils.NumberUtil.calcularMargemLucro(form.formObject.custo, form.formObject.precoVenda))
        } else if (getName == 'margemLucro') {
            if (form.formObject.margemLucro > 0)
                form.formElement.precoVenda.val(utils.NumberUtil.calcularPercentual(form.formObject.custo, form.formObject.margemLucro))
            else if (form.formObject.precoVenda > 0)
                form.formElement.margemLucro.val(utils.NumberUtil.calcularMargemLucro(form.formObject.custo, form.formObject.precoVenda))
        }

        return true
    }


    gruposTreeView(data = {}) {



        let overlay = $(`#block-form-produto #grupos-tree-view`).closest('.form-group').find('.overlay')

        overlay.show()

        utils.ApiUtil.listGruposTreeView(data.grupoId).then((r) => {

            $('#block-form-produto #grupos-tree-view').jstree({
                core: { data: r },
                "conditionalselect": function (node, event) {
                    return node.children.length === 0

                },
                "plugins": ["conditionalselect"]
            })

            overlay.hide()

            $('#block-form-produto #grupos-tree-view')
                .off("changed.jstree")
                .on("changed.jstree", (e, node) => {
                    if (parseInt(node.selected) > 0)
                        $('#block-form-produto #form-cadastro').find('#grupo-id').val(node.selected)
                    else
                        $('#block-form-produto #form-cadastro').find('#grupo-id').val('')
                })
        }).catch((err) => {
            overlay.hide()
        })


    }

    fabricaComboBox(data = {}) {



        let overlay = $(`#block-form-produto #fabrica`).closest('.form-group').find('.overlay')

        overlay.show()

        utils.ApiUtil.listFabricas().then((r) => {

            let options = '<option value="">Selecione</option>'

            r.forEach((item) => {
                options += `<option value="${item.pessoaId}"  ${utils.ObjectUtil.getValueProperty(data, 'pessoa.id') == item.pessoaId ? 'selected' : ''}>${item.razaoSocial} >> ${item.nomeFantasia}</option>`
            })

            overlay.hide()

            $('#block-form-produto #form-cadastro').find('#fabrica').html(options)



        }).catch((err) => {
            utils.MessageUtil.error(err)
            overlay.hide()
        })
    }


    statusComboBox(data = {}) {

        let overlay = $(`#block-form-produto #status`).closest('.form-group').find('.overlay')

        overlay.show()

        let options = ''

        utils.ApiUtil.listBooleanSimNao().forEach(item => {
            options += `<option value="${item.value}"  ${data.status == item.value ? 'selected' : ''}>${item.text}</option>`
        })

        overlay.hide()

        $('#block-form-produto #form-cadastro').find('#status').html(options)

    }



    volumeComboBox(data = {}) {

        let overlay = $(`#block-form-produto #volume`).closest('.form-group').find('.overlay')

        overlay.show()

        utils.ApiUtil.listVolumes().then((r) => {

            let options = '<option value="">Selecione</option>'

            r.forEach((item) => {
                options += `<option value="${item.id}"  ${data.volumeId == item.id ? 'selected' : ''}>${item.descricao}</option>`
            })

            overlay.hide()

            $('#block-form-produto #form-cadastro').find('#volume').html(options)



        }).catch((err) => {
            utils.MessageUtil.error(err)
            overlay.hide()
        })
    }

    tipoUnidadeComboBox(data = {}) {

        let overlay = $(`#block-form-produto #tipo-unidade`).closest('.form-group').find('.overlay')

        overlay.show()

        utils.ApiUtil.listTiposUnidades().then((r) => {



            let options = '<option value="">Selecione</option>'

            r.forEach((item) => {
                options += `<option value="${item.id}"  ${data.tipoUnidadeId == item.id ? 'selected' : ''}>${item.descricao}</option>`
            })

            overlay.hide()

            $('#block-form-produto #form-cadastro').find('#tipo-unidade').html(options)


        }).catch((err) => {
            utils.MessageUtil.error(err)
            overlay.hide()
        })
    }



    save(e) {
        e.preventDefault()

        this._model.save($('#block-form-produto #form-cadastro')).then((r) => {

            utils.MessageUtil.message(r.message, 'info', {
                buttons: {
                    'Fechar': (event) => {
                        utils.MessageUtil.closeButton(event)
                        this.renderCadastro(r.data)
                    }
                }
            })
        }).catch((err) => {
            utils.MessageUtil.error(err)
        })


    }




    renderCadastro(data = {}) {

        try {
            this.breadCrumbs()

            utils.HtmlUtil.loader()

            if (data.id === undefined)
                this._bread.add('Novo Cadastro').show()
            else
                this._bread.add(`Edição de Cadastro ${data.id}`).show()

            utils.UnderscoreUtil._template('#template-cadastro-produto', {}, '#inner-content')
            utils.UnderscoreUtil._template('#template-children-cadastro-produtos', { form: data }, '#inner-content-children')

            $.when(
                this.gruposTreeView(data),
                this.fabricaComboBox(data),
                this.volumeComboBox(data),
                this.tipoUnidadeComboBox(data),
                this.statusComboBox(data)
            )

            //if(!isNaN(data.id))
            $('#block-form-produto #form-cadastro #estoque').attr({ 'disabled': true })


            //utils.MaskInputUtil.mask()


        } catch (err) {
            utils.MessageUtil.error(err)
        }
    }


    render(produto) {
        try {

            utils.HtmlUtil.loader()

            this._bread.show()

            this.renderCadastro(produto)


        } catch (err) {
            utils.MessageUtil.message(err, 'danger')
        }
        return this
    }

}