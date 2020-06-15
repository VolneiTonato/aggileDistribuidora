module.exports = {
    TipoUnidadeView: () => { return new (require('./includes/complementos-produto/tipo-unidades/tipo-unidade-view'))() },
    TipoUnidadeListView: () => { return new (require('./includes/complementos-produto/tipo-unidades/tipo-unidade-list-view'))() }
}