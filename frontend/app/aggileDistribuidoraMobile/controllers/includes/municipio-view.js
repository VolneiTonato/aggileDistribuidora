let utils = require('../../../../helpers/utils-admin')



class MunicipioViewReport extends Backbone.View {

    constructor(param = {}) {
        super()

        this.$el = $(param.block)

        this._block = param.block

        this.overrideEvents()

        this.render()

    }

    reset(){
        this.$el.off('change', `form #report-municipio-list-add`)
    }

    overrideEvents() {
        this.reset()
        this.$el.find(`form #report-municipio-list-add`).on('change', MunicipioViewReport.changeSelectMunicipioList)
        
    }

    static async removeMunicipioLista(e){
        e.preventDefault()

        let $painel = $(e.currentTarget).closest('.panel-list-municipios-selecionados-report')

        let $tr = $(e.currentTarget).closest('tr')

        $tr.remove()

        if($painel.find('table').find('tr').length == 0)
            $painel.hide()
    }

    static async changeSelectMunicipioList(e){
        e.preventDefault()

        let id = parseInt($(e.currentTarget).val())

        let $painel = $(e.currentTarget).closest('.block-municipio-list-report').find('.panel-list-municipios-selecionados-report')

        let $table = $painel.find('table')

        if($table.find(`tr#key-municipio-report-${id}`).length > 0)
            return await utils.MessageUtil.alert('Municipio já selecionado!', 'warning')
        

        let municipio = await utils.IndexedDbUtil.findOne('municipios', { id: id })
        municipio.estado  = await utils.IndexedDbUtil.findOne('estados', {id : municipio.estadoId})

        let html = await utils.UnderscoreUtil._template('#template-adicionar-municipio-report', {municipio : municipio})

        if($table.find('tr').length > 0)
            $table.find('tr').first().before(html)
        else
            $table.append(html)

        $painel.show()


        $painel.find('.remover-municipio-selecionado-report').on('off')
        $painel.find('.remover-municipio-selecionado-report').on('click', MunicipioViewReport.removeMunicipioLista)

    }

    render(){
        return this
    }

    

}


module.exports = MunicipioViewReport


