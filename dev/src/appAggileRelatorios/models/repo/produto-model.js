const crud = require('../../../../models/aggile-admin/extras/includes/crud')
const utils = require('../../../../helpers/_utils/utils')

class ProdutoModel {

    constructor() {

    }

    async estoque(conditions = {}) {

        let where = {
            condition : [],
            orderBy : ''
        }
        let values = { }

        if(utils.ObjectUtil.getValueProperty(conditions, 'fabricaId')){
            where.condition.push(' AND produtos.fabrica_id = :fabricaId ')
            values.fabricaId = conditions.fabricaId
        }

        if(['maiorQueZero', 'zerado'].indexOf(utils.ObjectUtil.getValueProperty(conditions, 'visualizacaoEstoqueProdutoReport')) !== -1){
            if(conditions.visualizacaoEstoqueProdutoReport == 'maiorQueZero')
                where.condition.push(' AND  (produtos.estoque_unitario > 0 or produtos.estoque_atual > 0) ')
            else
                where.condition.push(' AND  (produtos.estoque_unitario <= 0 AND produtos.estoque_atual <= 0) ')
        }

        if(['ativo', 'inativo'].indexOf(utils.ObjectUtil.getValueProperty(conditions, 'visualizacaoStatusProdutoReport')) !== -1){
            if(conditions.visualizacaoStatusProdutoReport == 'ativo')
                where.condition.push(' AND  produtos.status = 1 ')
            else
                where.condition.push(' AND  produtos.status = 0 ')
        }

        if(utils.ObjectUtil.getValueProperty(conditions, 'orderby'))
            where.orderBy = ` ORDER BY ${conditions.orderby} `
        else
            where.orderBy = ` ORDER BY produtos.descricao `

        let query = `
            SELECT 
                produtos.referencia, produtos.descricao, produtos.estoque_unitario as estoqueUnitario, 
                produtos.estoque_atual as estoqueAtual, produtos.peso, produtos.custo, produtos.preco_venda as precoVenda, produtos.id,
                produtos.fracao as fracao,
                produtos.margem_lucro as margemLucro,
                grupos.bread_crumb as grupo

            FROM produtos

            JOIN pessoas ON pessoas.id = produtos.fabrica_id 

            JOIN grupos ON grupos.id = produtos.grupo_id

            WHERE produtos.deleted_at IS NULL

            AND pessoas.tipo_pessoa = 'fabrica'

            ${where.condition.join(' ')}

            ${where.orderBy}


        `

        return crud.query(query, values)
        
    }



}


module.exports = ProdutoModel