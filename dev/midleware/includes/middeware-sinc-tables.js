let formaPagamento = require('../../models/aggile-admin/includes/formaPagamentoModel')


let setup = () => {
    new formaPagamento().asyncFormasPagamento()

}


module.exports = setup





