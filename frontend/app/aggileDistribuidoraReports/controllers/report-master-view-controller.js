let utils = require('../../../helpers/utils-admin')

const municipioReport = require('./includes/municipio-view')

class ReportMasterModel extends utils.BackboneModelUtil {

}


class ReportMasterViewController extends Backbone.View {

    constructor(options = {}) {
        super()

        this._model = new ReportMasterModel()

        this.$el = $('body')

        this._reportEvents = {
            link: options.link
        }

        this.overrideEvents()



        this.render()
    }
    /*
    get events(){
        return {            
            [`click ${this._reportEvents.link} .link-report`]: 'generateReport'
        }

    }*/

    reset() {
        this.$el.off('click', `${this._reportEvents.link} .link-report`)
    }

    overrideEvents(append) {
        this.reset()

        let event = {
            [`click ${this._reportEvents.link} .link-report`]: 'generateReport'
        }

        if (_.isObject(append))
            Object.assign(event, append)

        this.delegateEvents(event)

    }


    changeTipoPessoaAutoCompleteReport(e) {
        let type = $(e.currentTarget).val()

        this.renderAutoCompletePessoa(type)
    }


    renderAutoCompletePessoa(type) {

        if ($(`body ${this._elementModalKey} #inner-pessoa-autocomplete`).length > 0) {

            $(`body ${this._elementModalKey} #inner-pessoa-autocomplete`).html('')

            if(type == 'sem-associacao')
                return false

            utils.UnderscoreUtil._template('#template-geral-autocomplete-pessoa', { data: { title: type } }, `${this._elementModalKey} #inner-pessoa-autocomplete`)
            

            utils.AutoCompleteUtil.AutoComplete({
                type: `${type}`,
                bloco: `body ${this._elementModalKey} #autocomplete-report-pessoa`,
                input: 'input[name="report_pessoaId"]',
                isClearValue: false

            })
        }
    }

    renderAutoCompleteProduto(elementId) {

        if ($(`body ${elementId} #autocomplete-report-produto`).length > 0) {

            utils.AutoCompleteUtil.AutoComplete({
                type: 'produto',
                bloco: `body ${elementId} #autocomplete-report-produto`,
                input: 'input[name="report_produtoId"]',
                isClearValue: false
            })
        }
    }

    municipioComponentes(elementId) {
        if ($(`body ${elementId} #form-report`).find('#report-municipio-id').length > 0) {

            let select = $(`${elementId} #form-report`).find('#report-municipio-id')

            utils.ApiUtil.municipios().then((municipios) => {
                select.append(`<option value="">Selecione</option>`)
                municipios.forEach((item) => { select.append(`<option value="${item.id}">${item.descricao}</option>`) })
            })
        }

        if ($(`body ${elementId} #form-report`).find('#report-municipio-list-add').length > 0) {

            let select = $(`${elementId} #form-report`).find('#report-municipio-list-add')

            utils.ApiUtil.municipios().then((municipios) => {
                select.append(`<option value="">Selecione</option>`)
                municipios.forEach((item) => { select.append(`<option value="${item.id}">${item.descricao}</option>`) })
            })
        }
    }

    componentes(elementId) {

        this._elementModalKey = elementId

        this.overrideEvents({ [`change ${this._elementModalKey} .report-tipo-pessoa-change`]: 'changeTipoPessoaAutoCompleteReport' })

        this.municipioComponentes(elementId)

        if ($(`body ${elementId} #form-report`).find('#report-status-pedido').length > 0) {

            let select = $(`${elementId} #form-report`).find('#report-status-pedido')

            utils.ApiUtil.statusPedido().then((status) => {
                select.append(`<option value="">Selecione</option>`)
                status.forEach((item) => { select.append(`<option value="${item.value}">${item.text}</option>`) })
            })
        }


        if ($(`body ${elementId} #form-report`).find('#report-status-nota').length > 0) {

            let select = $(`${elementId} #form-report`).find('#report-status-nota')

            utils.ApiUtil.statusNotasFiscaisEntrada().then((status) => {
                select.append(`<option value="">Selecione</option>`)
                status.forEach((item) => { select.append(`<option value="${item.value}">${item.text}</option>`) })
            })
        }

        if ($(`body ${elementId} #form-report`).find('#report-status').length > 0) {

            let select = $(`${elementId} #form-report`).find('#report-status')

            select.append(`<option value="">Selecione</option>`)

            let status = [{ value: 'ativo', text: 'Ativo' }, { value: 'inativo', text: 'Inativo' }]

            status.forEach((item) => {
                select.append(`<option value="${item.value}">${item.text}</option>`)
            })
        }

        if ($(`body ${elementId} #form-report`).find('#report-status-receita').length > 0) {

            let select = $(`${elementId} #form-report`).find('#report-status-receita')

            utils.ApiUtil.statusRecebimentos().then((status) => {
                select.append(`<option value="">Selecione</option>`)
                status.forEach((item) => { select.append(`<option value="${item.value}">${item.text}</option>`) })
            })
        }

        if ($(`body ${elementId} #form-report`).find('#report-fabrica-id').length > 0) {

            let select = $(`${elementId} #form-report`).find('#report-fabrica-id')

            utils.ApiUtil.listFabricas().then((fabricas) => {
                select.append(`<option value="">Selecione</option>`)
                fabricas.forEach((item) => { select.append(`<option value="${item.pessoaId}">${item.razaoSocial} - ${item.nomeFantasia}</option>`) })
            })
        }


        if ($(`body ${elementId} #form-report`).find('.bool-sim-nao').length > 0) {

            let select = $(`${elementId} #form-report`).find('.bool-sim-nao')

            select.append(`<option value="">Selecione</option>`)

            utils.ApiUtil.listBooleanSimNao().forEach(item => {
                select.append(`<option value="${item.value}">${item.text}</option>`)
            })
        }

        
        this.renderAutoCompleteProduto(elementId)
    }


    async generateReport(e) {
        e.preventDefault()


        let data = utils.JsonUtil.toParse($(e.currentTarget).find('span').text())

        let formTemplate = $.parseHTML(await utils.UnderscoreUtil._template('#template-form-master-filter-report', { form: data }))

        let html = await utils.UnderscoreUtil._template(data.templateId, { form: data })

        $(formTemplate).find('#block-itens-form').html(html)

        let modal = await utils.ModalUtil.modalVTT($(formTemplate).html(), `Report ${data.name}`, { buttonClose: true, width: '50%' })

        $(modal.element).dialog(modal.config).dialog('open')


        this.componentes(modal.config.key)


        new municipioReport({ block: modal.config.key })

        $(`${modal.config.key} #gerar-relatorio`).off('click')

        $(`${modal.config.key} #gerar-relatorio`).on('click', async (e) => {
            e.preventDefault()

            $(`${modal.config.key} #gerar-relatorio`).attr('disabled', true)

            let form = utils.FormUtil.mapObject($(e.currentTarget).closest('#form-report')).formObject

            if (utils.ObjectUtil.getValueProperty(form, 'report.municipioId'))
                form.report.municipio = (await utils.IndexedDbUtil.findOne('municipios', { id: parseInt(form.report.municipioId) })).descricao || ''



            $.post(`${form.report.action}`, { report: form.report, type: 'POST' })
                .then((response) => {

                    $(`${modal.config.key} #gerar-relatorio`).attr('disabled', false)

                    if (response.key && (response.key.length > 0))
                        utils.FormUtil.redirectBlank(`/reports/generate-report/${response.key}?type=${form.report.typeFormatReport}`)
                    else
                        utils.MessageUtil.error(utils.ObjectUtil.getValueProperty(response, 'message') || 'erro ao gerar relatório')

                }).catch((err) => {
                    $(`${modal.config.key} #gerar-relatorio`).attr('disabled', false)
                    utils.MessageUtil.error(err)
                })



        })

    }

    render() {
        return this
    }
}



module.exports = ReportMasterViewController