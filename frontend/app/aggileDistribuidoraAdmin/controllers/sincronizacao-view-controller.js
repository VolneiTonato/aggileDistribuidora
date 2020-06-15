
module.exports = {
    SincronizacaoEcommerce : ()  => { return new (require('./includes/sincronizacao/ecommerce/ecommerce')).EcommerceSincronizacao()}
}