module.exports = {
    Cedente : {
        CedenteListView : () => { return new (require('./includes/pessoas/cedente/cedente-list-view'))() },
        CedenteView : () => { return new (require('./includes/pessoas/cedente/cedente-view'))() },
        CedenteFormPesquisaView : () => { return new (require('./includes/pessoas/cedente/cedente-form-pesquisa-view'))() }
    }
}