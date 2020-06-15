let utils = require('../../../helpers/utils-admin')
let _ = require('lodash')

let cache = {
    conta: {}
}


let paginator = utils.PaginatorUtil.paginator()


class ContaPagarModel extends utils.BackboneModelUtil {

    constructor() {
        super()
    }

    defaults() {

    }


    model(form) {
        return utils.FormUtil.mapObject(form)
    }

    async save(data, isForm = true) {
        this.url = utils.UrlUtil.url(`admin/financeiro/contas-a-pagar/save`)

        let send = { data: isForm ? this.model(data).formObject : data, type: 'POST' }

        return await this.fetch(send)
    }


    async conta(id) {



        this.url = utils.UrlUtil.url(`admin/financeiro/contas-a-pagar/obter-conta`)

        let send = { data: { id: id }, type: 'POST' }

        return await this.fetch(send)
    }

    async pagamentoTotal(data) {

        this.url = utils.UrlUtil.url(`admin/financeiro/contas-a-pagar/pagamento-total`)

        let send = { data: data, type: 'POST' }

        return await this.fetch(send)
    }


    async pagamento(data) {

        this.url = utils.UrlUtil.url(`admin/financeiro/contas-a-pagar/pagamento`)

        let send = { data: data, type: 'POST' }

        return await this.fetch(send)
    }

    async listAllHistoricos(despesaId) {
        this.url = utils.UrlUtil.url(`admin/financeiro/contas-a-pagar/list-historicos-by-despesa`)

        let send = { data: { despesaId: despesaId }, type: 'GET' }

        return await this.fetch(send)
    }

    async saveHistorico(data) {
        this.url = utils.UrlUtil.url(`admin/financeiro/contas-a-pagar/save-historico`)

        let send = { data: data, type: 'POST' }

        return await this.fetch(send)
    }

    async cancelarDespesa(data) {
        this.url = utils.UrlUtil.url(`admin/financeiro/contas-a-pagar/cancelar-despesa`)

        let send = { data: data, type: 'POST' }

        return await this.fetch(send)
    }

    async findAllDespesas(data) {

        _.assign(data, paginator)

        this.url = utils.UrlUtil.url(`admin/financeiro/contas-a-pagar/listar-despesas`)

        let send = { type: 'POST', data: data }


        try {
            let retorno = await this.fetch(send)

            if (retorno.length > 0)
                paginator = utils.PaginatorUtil.calcularPaginator(paginator)


            return retorno

        } catch (err) {
            throw err
        }
    }
}

class ContaPagarListView extends Backbone.View {

    constructor() {
        super()

        this._bread = new utils.BreadCrumb()

        this.breadCrumbs()

        paginator = utils.PaginatorUtil.paginator()

        this._pathUrl = Backbone.history.getFragment()


        this._model = new ContaPagarModel()

        this.$el = $('body')

        this.overrideEvents()

        this.render()
    }

    breadCrumbs() {
        this._bread.add('inicio', '#home')
            .add('Contas a pagar', '#financeiro/contas-a-pagar/pesquisa')
    }

    reset() {
        this.$el.off('click', '#block-list-financeiro-despesa .btn-visualizar-despesa')
        this.$el.off('click', '#block-list-financeiro-despesa .btn-cancelar-despesa')
        this.$el.off('click', '#block-list-financeiro-despesa .pesquisar')
        this.$el.off('click', '#block-list-financeiro-despesa .limpar-pesquisa')
        this.$el.off('click', '#block-list-financeiro-despesa .carregar-mais')
        this.$el.off('click', '#block-list-financeiro-despesa .btn-pagar-total-despesa')
        this.$el.off('change', '#block-list-financeiro-despesa #form-pesquisa #pesquisa-tipo-pessoa')
    }


    overrideEvents() {
        this.reset()


        this.delegateEvents({
            "click #block-list-financeiro-despesa .btn-visualizar-despesa": "visualizarDespesaDetalhada",
            'click #block-list-financeiro-despesa .btn-cancelar-despesa': 'cancelarDespesa',
            'click #block-list-financeiro-despesa .pesquisar': 'pesquisarDespesas',
            'click #block-list-financeiro-despesa .limpar-pesquisa': 'limparPesquisa',
            'click #block-list-financeiro-despesa .carregar-mais': 'carregarMaisItensCadastro',
            'click #block-list-financeiro-despesa .btn-pagar-total-despesa': 'pagamentoTotalDespesa',
            'change #block-list-financeiro-despesa #form-pesquisa #pesquisa-tipo-pessoa': 'changeTipoPessoaAutoCompleteFormPesquisa'

        })

    }

    pagamentoTotalDespesa(e) {
        e.preventDefault()

        let data = utils.JsonUtil.toParse($(e.currentTarget).closest('.row-item-list').attr('data-item'))

        if (utils.NumberUtil.cdbl(data.valor) === utils.NumberUtil.cdbl(data.saldo) && utils.NumberUtil.cdbl(data.saldo) > 0 && data.status === 'aberta') {

            let run = () => {
                this._model.pagamentoTotal(data)
                    .then((ok) => {
                        utils.MessageUtil.alert('Conta paga com sucesso', 'success')
                        $(e.currentTarget).closest('.row-item-list').remove()
                    }).catch((err) => { utils.MessageUtil.error(err) })
            }


            let options = {
                buttons: {
                    'Sim': (e) => {
                        run()
                        utils.MessageUtil.closeButton(e)
                    },
                    'Fechar': (e) => {
                        utils.MessageUtil.closeButton(e)
                    }
                }
            }



            utils.MessageUtil.message('Deseja fazer o pagamento total desta fatura?',
                'info',
                options)


        } else {
            return utils.MessageUtil.alert('Esta conta já possui um lançamento de pagamento. Favor detalhar a conta e fazer o pagamento!', 'warning')
        }

    }

    limparPesquisa(e) {
        e.preventDefault()

        utils.localStorageUtil.removeStorage('ultima_pesquisa_despesas_cadastro')

        this.renderFormPesquisa()
    }

    cancelarDespesa(e) {
        e.preventDefault()

        let data = utils.JsonUtil.toParse($(e.currentTarget).closest('.row-item-list').attr('data-item'))

        if (data.status != 'aberta')
            return utils.MessageUtil.message('Não é possível cancelar esta despesa!', 'warning')


        let run = () => {

            this._model.cancelarDespesa(data).then((r) => {
                this.render()
            }).catch((err) => {
                utils.MessageUtil.error(err)
            })
        }


        let options = {
            buttons: {
                'Sim': (e) => {
                    run()
                    utils.MessageUtil.closeButton(e)
                },
                'Fechar': (e) => {
                    utils.MessageUtil.closeButton(e)
                }
            }
        }



        utils.MessageUtil.message('Deseja realmente cancelar este lançamento de Despesa?',
            'success',
            options)

    }



    visualizarDespesaDetalhada(e) {
        e.preventDefault()

        let data = utils.JsonUtil.toParse($(e.currentTarget).closest('.row-item-list').attr('data-item'))

        window.location.hash = "#financeiro/contas-a-pagar/lancamento"

        new ContaPagarView(data)

    }

    changeTipoPessoaAutoCompleteFormPesquisa(e){
        let type = $(e.currentTarget).val()

        let form = utils.FormUtil.mapObject('#block-list-financeiro-despesa #form-pesquisa')

        if(_.get(form, 'pesquisa')){
            form.pesquisa.pessoaNome.val('')
            form.pesquisa.pessoaId.val('')
        }



        this.renderAutoCompleteClienteFormPesquisa(type)
    }

    selectTipoPessoaByPessoaFormPesquisa(tipoPessoa){
        if(!tipoPessoa)
            return false

        let block = $('#block-list-financeiro-despesa #form-pesquisa')

        

        block.find('#pesquisa-tipo-pessoa:radio').filter( (i, item) => {
            $(item).attr('checked', false)
            if($(item).val() == tipoPessoa)
                $(item).attr({checked: true})
        })
    }

    renderAutoCompleteClienteFormPesquisa(type, data = {}) {

        let form = this.getFormPesquisaCache()

        $('#block-list-financeiro-despesa #form-pesquisa #inner-pessoa-autocomplete-pesquisa').html('')

        if(!type)
            return false

        if(form.tipoPessoa != type){
            form.pessoaNome = ''
            form.pessoaId =  ''
        }

        utils.UnderscoreUtil._template('#template-geral-autocomplete-pessoa', { data: {title: type, name: _.get(form, 'pessoaNome') } }, '#inner-pessoa-autocomplete-pesquisa')

        utils.AutoCompleteUtil.AutoComplete({
            type: type,
            bloco: '#block-list-financeiro-despesa #form-pesquisa #bloco-autocomplete-pessoa',
            input: 'input[name="pesquisa_pessoaId"]',
            isClearValue: false,
            form: '#block-list-financeiro-despesa #form-pesquisa',
            callback : (item) => {

                let name = undefined
                let tipoPessoa = _.get(item,'data.tipoPessoa')

                switch(tipoPessoa){
                    case 'cliente':
                    case 'fabrica':
                    case 'cedente':
                        name = _.get(item, `data.${tipoPessoa}.razaoSocial`)
                        break
                    case 'vendedor':
                        name = _.get(item, 'data.vendedor.nome')
                        break
                }

                if(name)
                    $('#block-list-financeiro-despesa #form-pesquisa input[name="pesquisa_pessoaNome"]').val(name)
        
            }

        })
    }

    getFormPesquisaCache() {
        let form = {}

        if (utils.localStorageUtil.isStorageItem('ultima_pesquisa_despesas_cadastro'))
            form = utils.localStorageUtil.getStorage('ultima_pesquisa_despesas_cadastro')

        return form
    }


    renderFormPesquisa() {

        let form = this.getFormPesquisaCache()


        utils.UnderscoreUtil._template("#template-form-pesquisa-despesa", { form: form }, '#inner-form-pesquisa-despesa')


        $.when(utils.EstadoMunicipioUtil.municipioSelectBox(
            {
                municipioElement: '#block-list-financeiro-despesa #pesquisa-municipio',
                municipio: form.municipio
            }
        ))


        this.selectTipoPessoaByPessoaFormPesquisa(_.get(form, 'tipoPessoa'))

        this.renderAutoCompleteClienteFormPesquisa( _.get(form, 'tipoPessoa') , form)

        let select = $('#block-list-financeiro-despesa #form-pesquisa').find('#pesquisa-status')

        utils.ApiUtil.statusDespesas().then((status) => {


            select.append(`<option value="">Selecione</option>`)
            select.append(`<option value="all">Todos</option>`)

            status.forEach((item) => {

                select.append(`<option value="${item.value}" ${item.value == form.status ? 'selected' : ''} >${item.text}</option>`)
            })
        })


    }

    pesquisarDespesas(e) {
        e.preventDefault()

        let form = utils.FormUtil.mapObject('#block-list-financeiro-despesa #form-pesquisa')

        utils.localStorageUtil.setStorage('ultima_pesquisa_despesas_cadastro', form.formObject.pesquisa)

        paginator = utils.PaginatorUtil.paginator()


        this.carregarListaDespesas()

    }


    carregarMaisItensCadastro(e) {
        e.preventDefault()

        $('#block-list-financeiro-despesa .carregar-mais').attr({ 'disabled': true })

        this.carregarListaDespesas({ append: true })
    }


    carregarListaDespesas(options) {

        let form = this.getFormPesquisaCache()


        let overlay = $(`#block-list-financeiro-despesa #overlay-painel-list-cadastro`).find('.overlay')

        overlay.show()

        if (Object.getOwnPropertyNames(form).length == 0)
            form = { status: 'pendente' }




        this._model.findAllDespesas(form)
            .then((r) => {


                this.renderDespesas(r, options)

            }).catch((err) => {

                utils.MessageUtil.error(err)

            }).finally(() => {

                

                overlay.hide()
            })




    }


    renderTela() {

        try {

            //this.breadCrumbs()

            utils.HtmlUtil.loader()


            //Template layout.pug
            utils.UnderscoreUtil._template('#template-financeiro-despesa', {}, '#inner-content')

            //template despesa.pug
            utils.UnderscoreUtil._template('#template-children-financeiro-despesa', {}, '#inner-content-children')

            //template despesa
            utils.UnderscoreUtil._template('#template-children-financeiro-despesa-list', {}, '#inner-content-children-financeiro-despesa')

            utils.UnderscoreUtil._template('#template-list-despesa-lancadas-parent', {}, '#inner-despesa-lancadas-parent')

            this.renderFormPesquisa()
        } catch (err) {
            utils.MessageUtil.error(err)
        }
    }

    renderDespesas(data = {}, options = {}) {



        _.assign(options, { isDesktopMobile: true, closeLoader: true })

        utils.UnderscoreUtil._template('#template-list-despesa-lancadas', { recebimentos: data }, '#inner-despesa-lancadas', options)

        if (data.length > 0)
            $('#block-list-financeiro-despesa .carregar-mais').attr({ 'disabled': false })


        $('#block-list-financeiro-despesa').find('#inner-despesa-lancadas-desktop, #inner-despesa-lancadas-mobile').find('.status-print').each((i, item) => {

            let block = $(item).closest('.row-item-list')

            let status = $(item).text()


            if (['cancelada', 'paga'].indexOf(status) !== -1)
                $(block).find('.btn-cancelar-despesa').hide()

            if(['aberta'].indexOf(status) !== -1)
                $(block).find('.btn-pagar-total-despesa').show()
            else
                $(block).find('.btn-pagar-total-despesa').hide()

        })
    }



    render() {
        try {

            utils.HtmlUtil.loader()

            this._bread.show()

            this.renderTela()
            this.carregarListaDespesas()

        } catch (err) {
            utils.MessageUtil.message(err, 'danger')
        }
        return this
    }

}



class ContaPagarView extends Backbone.View {
    constructor(conta = {}) {
        super()



        this._bread = new utils.BreadCrumb()

        this.breadCrumbs()



        this._bloco = {
            principal: '#block-form-financeiro-contas-a-pagar',
            formHistoricoLancamento: '#form-financeiro-despesa-lancamento-historico',
            formCadastro: '#form-cadastro'
        }

        this._pathUrl = Backbone.history.getFragment()


        this._model = new ContaPagarModel()

        this.$el = $('body')

        this.overrideEvents()



        this.render(conta)
    }

    breadCrumbs() {
        this._bread.add('inicio', '#home')
            .add('Contas a pagar', '#financeiro/contas-a-pagar/pesquisa')
    }


    reset() {
        this.$el.off('click', '#block-form-financeiro-contas-a-pagar #adicionar-historico')
        this.$el.off('click', '#block-form-financeiro-contas-a-pagar .editar-historico-lancado')
        this.$el.off('click', '#block-form-financeiro-contas-a-pagar #btn-lancar-despesa')
        this.$el.off('change', '#block-form-financeiro-contas-a-pagar #lancamento-forma-pagamento')
        this.$el.off('click', '#block-form-financeiro-contas-a-pagar .pagar-historico-lancado')
        this.$el.off('click', '#block-form-financeiro-contas-a-pagar #pagar-historico')
        this.$el.off('click', '#block-form-financeiro-contas-a-pagar #btn-novo-cadastro')
        this.$el.off('click', '#block-list-financeiro-despesa #btn-novo-cadastro')
        this.$el.off('click', '#block-form-financeiro-contas-a-pagar #form-cadastro .btn-lancar-despesa-paga')
        this.$el.off('change', '#block-form-financeiro-contas-a-pagar #form-cadastro #tipo-pessoa')
    }


    overrideEvents() {
        this.reset()


        this.delegateEvents({
            "click #block-form-financeiro-contas-a-pagar #btn-lancar-despesa": "save",
            "click #block-form-financeiro-contas-a-pagar #adicionar-historico": "lancarHistorico",
            "click #block-form-financeiro-contas-a-pagar .editar-historico-lancado": "editarHistorico",
            "click #block-form-financeiro-contas-a-pagar .pagar-historico-lancado": "pagamentoHistorico",
            "click #block-form-financeiro-contas-a-pagar #pagar-historico": "pagamento",
            'change #block-form-financeiro-contas-a-pagar #lancamento-forma-pagamento': "changeFormaPagamento",
            'click #block-form-financeiro-contas-a-pagar #btn-novo-cadastro': 'novoCadastro',
            'click #block-list-financeiro-despesa #btn-novo-cadastro': 'renderCadastro',
            'click #block-form-financeiro-contas-a-pagar #form-cadastro .btn-lancar-despesa-paga': 'lancarDespesaComoPaga',
            'change #block-form-financeiro-contas-a-pagar #form-cadastro #tipo-pessoa':'changeTipoPessoaAutoComplete'


        })

    }

    novoCadastro(e) {
        e.preventDefault()

        this.render()

    }

    changeFormaPagamento(e) {
        e.preventDefault()




        $(`${this._bloco.principal} #bloco-data-bom-para`).hide()

        let value = $(e.currentTarget).val()

        if (['cheque_pre', 'recibo', 'boleto_a_prazo', 'deposito'].indexOf(value) != -1)
            $(`${this._bloco.principal} #bloco-data-bom-para`).show()
    }

    pagamento(e, historico) {
        e.preventDefault()

        try {

            let data = {}

            if (!historico) {

                historico = utils.FormUtil.mapObject(`${this._bloco.principal} #form-financeiro-despesa-pagamento-historico`).formObject



                data = utils.JsonUtil.toParse($("#form-financeiro-despesa-pagamento-historico").attr('data-item'))


                if (!utils.ObjectUtil.hasProperty(historico, 'lancamento'))
                    throw 'Objeto inválido! Atualize a página!'

            } else {



                historico.lancamento.status = 'paga'
                historico.lancamento.isPagamentoMarcado = true

            }





            let retorno = async () => {

                try {

                    let r = await this._model.pagamento(historico.lancamento)

                    $(`${this._bloco.principal} #inner-form-historico`).html('').hide()

                    $(`${this._bloco.principal} #inner-form-historico-pagamento`).html('').show()


                    let conta = await this._model.conta(historico.lancamento.despesaId)

                    new ContaPagarView(conta)


                } catch (err) {
                    utils.MessageUtil.error(err)
                }

            }

            if (!historico.lancamento.isPagamentoMarcado && (utils.NumberUtil.cdbl(historico.lancamento.valorPago) < utils.NumberUtil.cdbl(data.valor))) {

                let options = {
                    buttons: {
                        'Sim': (e) => {
                            historico.lancamento.lancarNovaConta = true
                            retorno()
                            utils.MessageUtil.closeButton(e)
                        },
                        'Não': (e) => {
                            retorno()
                            utils.MessageUtil.closeButton(e)
                        },
                        'Fechar': (e) => {
                            utils.MessageUtil.closeButton(e)
                        }
                    }
                }



                utils.MessageUtil.message('Atenção!<br />O valor da conta é menor que o valor a receber!<br />Deseja lançar uma nova parcela?',
                    'success',
                    options)

            } else {
                retorno()
            }

        } catch (err) {
            utils.MessageUtil.error(err)
        }
    }


    pagamentoHistorico(e) {
        e.preventDefault()

        let data = utils.JsonUtil.toParse($(e.currentTarget).closest('.row-item-list').attr('data-item'))

        this.renderPagamentoHistorico(data)
    }

    editarHistorico(e) {
        e.preventDefault()

        let data = utils.JsonUtil.toParse($(e.currentTarget).closest('.row-item-list').attr('data-item'))

        this.renderHistorico(data)


    }

    lancarDespesaComoPaga(e) {
        e.preventDefault()

        let historico = utils.JsonUtil.toParse($(e.currentTarget).closest('.row-item-list').attr('data-item'))

        this.pagamento(e, { lancamento: historico })
    }


    lancarHistorico(e, historico) {
        e.preventDefault()

        let conta = utils.FormUtil.mapObject(`${this._bloco.principal} ${this._bloco.formCadastro}`)

        let lancamento = conta.formObject.lancamento

        

        if (historico) {
            lancamento = historico
            lancamento.status = 'paga'
            lancamento.isPagamentoMarcado = true
        } else {
            lancamento.despesaId = conta.formObject.id
        }

        this._model.saveHistorico(lancamento).then(async (r) => {

            let historico = _.find(cache.conta.historicos, { id: r.id })

            if (historico) {

                let historicos = cache.conta.historicos.filter(item => {
                    if(item.id == r.id)
                        return r
                })

                cache.conta.historicos = historicos
            } else {
                cache.conta.historicos.push(r)
            }

            this.renderCadastro(cache.conta)

        }).catch((err) => {
            utils.MessageUtil.error(err)
        })


    }


    save(e, options = {}) {
        e.preventDefault()

        this._model.save($(`${this._bloco.principal} ${this._bloco.formCadastro}`)).then( (r) => {

            utils.MessageUtil.message(r.message, 'info', {
                buttons: {
                    'Fechar': async (event) => {
                        utils.MessageUtil.closeButton(event)
                        cache.conta = r.data

                        if(r.data.historicos.length ===  0){
                            let historico = await this._model.saveHistorico({
                                vencimento : r.data.createdAt,
                                valor : r.data.valor,
                                despesaId : r.data.id,
                                status: r.data.status
                            }).catch(err => { utils.MessageUtil.error('Ocorreu um erro ao lançar o histórico. Volte e lance o mesmo manualmente.') })

                            cache.conta.historicos.push(historico)
                        }


                        this.renderCadastro(r.data)
                    }
                }
            })
        }).catch((err) => {
            utils.MessageUtil.error(err)
        })


    }

    changeTipoPessoaAutoComplete(e){
        let type = $(e.currentTarget).val()
        this.renderAutoCompletePessoa(type)
    }

    selectTipoPessoaByPessoa(tipoPessoa){
        if(!tipoPessoa)
            return false

        let block = $('#block-form-financeiro-contas-a-pagar #form-cadastro')

        //block.find(`#tipo-pessoa[value="${tipoPessoa}"]`).attr({'checked': true})

        block.find('#tipo-pessoa:radio').filter( (i, item) => {
            $(item).attr('checked', false)
            $(item).attr({'disabled':true})
            if($(item).val() == tipoPessoa)
                $(item).attr({checked: true})
        })
    }

    renderAutoCompletePessoa(type , data = {}){

        let name = ''

        switch(type){
            case 'cliente':
            case 'fabrica':
            case 'cedente':
                name = _.get(data, `pessoa.${type}.razaoSocial`)
                break
            case 'vendedor':
                name = _.get(data, 'pessoa.vendedor.nome')
                break
        }

        $('#inner-pessoa-autocomplete').html('')
        

        if(!type)
            return false


        utils.UnderscoreUtil._template('#template-geral-autocomplete-pessoa', { data: {title: type, name: name } }, '#inner-pessoa-autocomplete')

        utils.AutoCompleteUtil.AutoComplete({
            type: type,
            bloco: '#block-form-financeiro-contas-a-pagar #bloco-autocomplete-pessoa',
            input: 'input[name="pessoaId"]',
            isClearValue: false,
            parent: '#form-cadastro'

        })

        if(_.get(data, 'pessoa.id'))
            $('#block-form-financeiro-contas-a-pagar #bloco-autocomplete-pessoa').attr('disabled','disabled')
    }


    renderHistoricosLancados(data = {}) {

        if (!_.isArray(data.historicos))
            return
        else if (data.historicos.length == 0)
            return

        $(`${this._bloco.principal} #inner-historicos-lancados`).show()


        utils.UnderscoreUtil._template('#template-financeiro-despesa-historicos-lancados', { historicos: data.historicos, conta: data.conta }, '#inner-historicos-lancados')


        $("#block-form-financeiro-contas-a-pagar #form-cadastro .status-print").each((i, item) => {

            let row = $(item).closest('.row-item-list')

            //let formasPagamentoPrazo = ['cheque_pre', 'recibo', 'boleto_a_prazo', 'deposito']

            let historico = utils.JsonUtil.toParse($(row).attr('data-item'))

            

            if (['cancelada', 'paga'].indexOf(data.status) != -1) {

                $(row).find('.bloco-botoes-historicos-cantas-lancados').html('')

            } else {

                if (['aberta'].indexOf(data.status) != -1) {



                    switch (historico.status) {
                        case 'paga':
                        case 'cancelada':
                            $(row).find('.btn-lancar-despesa-paga').hide()
                            $(row).find('.editar-historico-lancado').hide()
                            $(row).find('.pagar-historico-lancado').hide()
                            break
                        case 'pendente':
                            //if (formasPagamentoPrazo.indexOf(historico.formaPagamento) != -1) {
                            $(row).find('.pagar-historico-lancado').hide()
                            $(row).find('.btn-lancar-despesa-paga').show()
                            //} else {
                            //    $(row).find('.pagar-historico-lancado').show()
                            //    $(row).find('.btn-lancar-despesa-paga').hide()
                            //}
                            break
                    }

                }
            }
        })
    }

    renderFormaPagamentoSelectBox(data = {}, bloco) {



        utils.ApiUtil.formasPagamento().then((r) => {

            let options = '<option value="">Selecione</option>'

            r.forEach((item) => {

                options += `<option value="${item.value}" ${data.formaPagamento == item.value ? 'selected' : ''}>${item.text}</option>`

            })

            $(bloco)
                .html(options)
                .trigger('change')
        })


    }


    renderPagamentoHistorico(data = {}) {

        $(`${this._bloco.principal} #inner-form-historico`).html('').hide()

        $(`${this._bloco.principal} #inner-form-historico-pagamento`).html('').show()

        utils.UnderscoreUtil._template('#template-financeiro-despesa-historicos-pagamento-form', { historico: data }, '#inner-form-historico-pagamento')

        this.renderFormaPagamentoSelectBox(data, '#block-form-financeiro-contas-a-pagar #form-financeiro-despesa-pagamento-historico #lancamento-forma-pagamento')
    }


    renderHistorico(data = {}) {

        $(`${this._bloco.principal} #inner-form-historico-pagamento`).html('').hide()


        $(`${this._bloco.principal} #inner-form-historico`).html('').show()


        data.status = 'aberta'

        if (data.id) {
            if (data.valorPago > 0)
                data.valor = data.valorPago
        }

        if (!utils.ObjectUtil.getValueProperty(data, 'notaEntradaId'))
            utils.UnderscoreUtil._template('#template-financeiro-despesa-lancamento-historico-form', { historico: data }, '#inner-form-historico')

        this.renderFormaPagamentoSelectBox(data, '#block-form-financeiro-contas-a-pagar #form-financeiro-despesa-lancamento-historico #lancamento-forma-pagamento')

        if (data.id) {
            $('#block-form-financeiro-contas-a-pagar #lancamento-valor').attr({ 'disabled': true })
            $('#block-form-financeiro-contas-a-pagar #adicionar-historico').text('Atualizar')

        }


    }

    renderCadastro(data = {}) {

        try {


            $(`${this._bloco.principal} #inner-form-historico`).html('').hide()
            $(`${this._bloco.principal} #inner-historicos-lancados`).html('').hide()

            this.breadCrumbs()

            utils.HtmlUtil.loader()

            if (data.id === undefined)
                this._bread.add('Novo Cadastro').show()
            else
                this._bread.add(`Edição de Cadastro ${data.id}`).show()



            //Template layout.pug
            utils.UnderscoreUtil._template('#template-financeiro-despesa', {}, '#inner-content')

            //template despesa.pug
            utils.UnderscoreUtil._template('#template-children-financeiro-despesa', {}, '#inner-content-children')

            //tempalte despesa.pug
            utils.UnderscoreUtil._template('#template-children-financeiro-despesa-lancamento', {}, '#inner-content-children-financeiro-despesa')


            utils.UnderscoreUtil._template('#template-financeiro-despesa-lancamento-form-principal', {}, '#inner-content-children-financeiro-despesa')

            this.selectTipoPessoaByPessoa(_.get(data, 'pessoa.tipoPessoa'))

            this.renderAutoCompletePessoa( _.get(data, 'pessoa.tipoPessoa') ,data)


            utils.UnderscoreUtil._template('#template-financeiro-despesa-lancamento-cabecalho', { form: data }, '#inner-cabecalho')


            if (data.id) {

                $("#block-form-financeiro-contas-a-pagar #btn-lancar-despesa").text('Save')

                $("#block-form-financeiro-contas-a-pagar #bloco-btn-lancar").hide()

                if (utils.ObjectUtil.hasProperty(data.pedidoCliente, 'id'))
                    $('#block-form-financeiro-contas-a-pagar #form-cadastro #descricao').attr({ 'disabled': true })

                $('#block-form-financeiro-contas-a-pagar #form-cadastro #valor').attr({ 'disabled': true })


                if (['cancelada', 'paga', 'pendente'].indexOf(data.status) == -1)
                    this.renderHistorico(data)


                if (['cancelada', 'paga'].indexOf(data.status) != -1) {
                    $("#block-form-financeiro-contas-a-pagar #btn-lancar-despesa").hide()
                    $('#block-form-financeiro-contas-a-pagar #form-cadastro .form-control').each((i, item) => { $(item).attr('disabled', true) })
                }

                this.renderHistoricosLancados(data)

                if (['aberta', 'pendente'].indexOf(data.status) !== -1) {
                    $('#block-form-financeiro-contas-a-pagar #form-cadastro #block-botoes-devedor-contas-a-pagar').show()
                }

            } else {
                $("#block-form-financeiro-contas-a-pagar #btn-lancar-despesa").text('Lançar')
            }




        } catch (err) {
            utils.MessageUtil.error(err)
        }
    }

    render(conta = {}) {
        try {

            if (conta)
                cache.conta = conta

            utils.HtmlUtil.loader()

            this._bread.show()

            this.renderCadastro(conta)

        } catch (err) {
            utils.MessageUtil.message(err, 'danger')
        }
        return this
    }


}


module.exports = {
    ContaPagarView: (data) => { return new ContaPagarView(data) },
    ContaPagarListView: () => { return new ContaPagarListView() }
} 