let utils = require('../../../helpers/utils-admin')

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

    reset() {
        this.$el.off('click', `${this._reportEvents.link} .link-report`)
    }

    overrideEvents() {
        this.reset()

        let strJson = $.trim(`{
            "click ${this._reportEvents.link} .link-report" : "generateReport"
        }`)

        let data = JSON.parse(strJson)

        this.delegateEvents(data)

    }


    renderAutoCompleteCliente(elementId) {

        if ($(`body ${elementId} #autocomplete-report-cliente`).length > 0) {

            utils.AutoCompleteUtil.AutoComplete({
                type:'cliente',
                bloco: `body ${elementId} #autocomplete-report-cliente`,
                input: 'input[name="report_clienteId"]',
                isClearValue: false
            })
        }
    }

    componentes(elementId) {

   

        this.renderAutoCompleteCliente(elementId)
    }


    async generateReport(e) {
        e.preventDefault()


        let data = utils.JsonUtil.toParse($(e.currentTarget).find('span').text())

        let formTemplate = $.parseHTML(await utils.UnderscoreUtil._template('#template-form-master-filter-report', { form: data }))

        let html = await utils.UnderscoreUtil._template(data.templateId, { form: data })

        $(formTemplate).find('#block-itens-form').html(html)

        let modal = await utils.ModalUtil.modalVTT($(formTemplate).html(), `Report ${data.name}`, { buttonClose: true})

        $(modal.element).dialog(modal.config).dialog('open')


    }

    render() {
        return this
    }
}


module.exports = ReportMasterViewController