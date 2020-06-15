const sequelize = require('./entityes/index')
const _ = require('lodash')
const enumns = require('./enuns/enum')



class FormaPagamentoModel {

    constructor() {
        
        this._model = sequelize.entity.FormaPagamento
        
    }


    async asyncFormasPagamento() {

        

        let formasPagamento = await this._model.findAll()


        let descricoesEnum = enumns.EnumFormaPagamento.map( (item) => { return item.text } )

        


        if (formasPagamento.length > 0) {

            let descricao = []

            formasPagamento.forEach( (item) => {
                if(item.deleted_at == null)
                    descricao.push(item.descricao)
            })

            descricoesEnum.forEach( (item) => {
                if(descricao.indexOf(item) == -1)
                    this.save({descricao : item})
            })

            descricao.forEach( (item) => {
                if(descricoesEnum.indexOf(item) == -1)
                    this._model.destroy({ where: { descricao: item } })
            })

            
        }else{
            enumns.EnumFormaPagamento.forEach( (item) => {
                this.save( {descricao: item.text})
            } )




        }

        
    }



    async update(data) {

        let id = data.id


        _.unset(data, 'id')

        await this._model.update(data, { where: { id: id }, validate: true })


        return await this.findOne({id : id})
    }

    async createOrUpdate(data) {
        if (data.id)
            return await this.update(data)
        else
            return await this.save(data)
    }

    async save(data) {

        await this._model.create(data, { validate: true })

        return await this.findOne({id : data.id})


    }

    async findOne(conditions) {

        let where = {
            where: conditions,
            // order: [orderby]
        }

        return await this._model.findOne()
    }

    async findAll(where) {
        return await this._model.findAll()
    }



}


module.exports = FormaPagamentoModel