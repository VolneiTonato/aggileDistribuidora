module.exports = {
    GrupoView : () => { return new (require('./includes/complementos-produto/grupos/grupo-view'))() },
    GrupoListView : () => { return new (require('./includes/complementos-produto/grupos/grupo-list-view'))()},
    GrupoListViewEcommerce : () => { return new (require('./includes/complementos-produto/grupos/grupo-repasse-ecommerce-view'))() }
} 