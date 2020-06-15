module.exports = {
    ProdutoView: () => { return new (require('./includes/produtos/produto-view'))() },
    ProdutoListView: () => { return new (require('./includes/produtos/produto-list-view'))() },
    ProdutoListViewEcommerce: () => { return new (require('./includes/produtos/produto-repasse-ecommerce-view'))() },
} 