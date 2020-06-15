const include = {
    store : require('./local-storage-util'),
    indexDbUtil : require('./indexed-db-utils')(),
    jqxTreeUtil : require('./jqx-tree-util')()
}

class ApiUtil {

    static async estados(uf) {
        return await include.indexDbUtil.findOne('estados', {uf : uf})
    }

    static async municipios(codigo = 21) {

        return await include.indexDbUtil.findAll('municipios', {estadoId : parseInt(codigo)})

    }

    static async statusCheque(){
        return await include.indexDbUtil.findAll('statusCheque')
    }

    static async tiposEstabelecimentoEnum(){
        return await include.indexDbUtil.findAll('tipoEstabelecimentoEnumerador') 
    }


    static async statusRecebimentos(){

        return await include.indexDbUtil.findAll('statusRecebimentos')
    }

    static async statusDespesas(){

        return await include.indexDbUtil.findAll('statusDespesas')
    }

    static async statusPedido(){

        return await include.indexDbUtil.findAll('statusPedido')
    }


    static async statusPedidoFabrica(){

        return await include.indexDbUtil.findAll('statusPedidoFabrica')
    }

    static async listGrupos(){

        return await include.indexDbUtil.findAll('grupos')
    }

    static async statusNotasFiscaisEntrada(){

        return await include.indexDbUtil.findAll('statusNotasFiscais')

    }

    static async formasPagamento(){

        return await include.indexDbUtil.findAll('formasPagamento')
    }

    static async estadoMunicipios(uf) {

        let estado = await include.indexDbUtil.findOne('estados', {uf : uf})

        let municipios  = await include.indexDbUtil.findAll('municipios', {estadoId : parseInt(estado?.id)})

        return await { estado: estado, municipios: municipios }
    }


    static async listGruposTreeView(grupoPaiId = null, options = {}) {

        return await include.jqxTreeUtil.comboBoxGruposTreeView(null, 0 , grupoPaiId, options)
       
    }

    static async listOperacaoInventario(){
        return await include.indexDbUtil.findAll('operacaoInventario')
    }

    static async listPermissoesUsuario(){
        return await $.post('api/usuario/permissoes-enums', 'json')
    }

    static async listFabricas() {

        return await include.indexDbUtil.findAll('fabricas')
    }

    static async listVolumes() {
        return await include.indexDbUtil.findAll('volumes')
    }

    static async listTiposUnidades() {

        return await include.indexDbUtil.findAll('tiposUnidade')
    }

    static async listMotivosDevolucaoCheque(){
        return await include.indexDbUtil.findAll('motivoDevolucaoCheques')
    }

    static async listOrigemLancamentoCheque(){
        return await include.indexDbUtil.findAll('origemLancamentoCheque')
    }


    static listBooleanSimNao(){
        return [
            {value: true, text: 'SIM'},
            {value: false, text: 'NÃO', default: true}
        ]
    }


}

module.exports = () => {
    return ApiUtil
}