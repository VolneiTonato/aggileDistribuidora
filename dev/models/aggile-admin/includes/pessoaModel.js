const sequelize = require('./entityes/index')
const utilModel = require('../extras/utils-model')
const utils = require('../../../helpers/_utils/utils')
const relation = require('./enuns/relation')
const _ = require('lodash')

class PessoaModel {

    constructor() {
        this._model = sequelize.entity.Pessoa

        process.nextTick(() => {
            this._enderecoModel = require('./enderecoModel')
            this._telefoneModel = require('./telefoneModel')

        })
    }


    async findByTipoAll(type) {
        let query = {
            include: relation().RelationPessoa([type]),
            where: { tipoPessoa: type }
        }

        return await this._model.findAll(query)
    }





    async pesquisar(conditions = {}) {


        let query = {}

        if (utils.ObjectUtil.getValueProperty(conditions, 'paginator.limit'))
            query.limit = parseInt(conditions.paginator.limit)

        if (utils.ObjectUtil.getValueProperty(conditions, 'paginator.offset'))
            query.offset = parseInt(conditions.paginator.offset)


        return await this._model.findAll(query)
    }


    async saveComplementos(id, data, type, options) {
        await new this._enderecoModel().saveRelation(data.endereco, { id: id, type: type }, options)
        await new this._telefoneModel().saveTelefones(id, data.telefones, type, options)
    }


    /**
     * 
     * @param {*} idParent 
     * @param {*} tipoPessoa 
     * @param {*} options
     */
    async save(post = {}, data = {}, options = {}) {
        let { tipoPessoa, idParent } = data

        let pessoa = {
            tipoPessoa: tipoPessoa,
            [`${tipoPessoa}Id`]: idParent
        }

        let pessoaUnique = await utilModel.CrudUtil.uniqueField(this._model, undefined, pessoa)


        if (pessoaUnique)
            throw 'Pessoa já cadastrada!'


        let currentSave = await this._model.create(pessoa, options)

        try {
            await this.saveComplementos(currentSave.id, post, pessoa.tipoPessoa, options)
        } catch (err) {
            if (utils.ObjectUtil.getValueProperty(data, 'isComplementoValidate') == false && utils.ObjectUtil.getValueProperty(err, 'name') == 'SequelizeValidationError') {
                //sem teste
            } else {
                return Promise.reject(err)
            }
        }


        return this._model.findByPk(currentSave.id)

    }


    /**
     * 
     * @param {*} idParent 
     * @param {*} tipoPessoa 
     * @param {*} options
     */
    async update(post = {}, data = {}, options = {}) {
        let { tipoPessoa, idParent } = data

        let pessoa = {
            tipoPessoa: tipoPessoa,
            [`${tipoPessoa}Id`]: idParent
        }

        let pessoaUnique = await utilModel.CrudUtil.uniqueField(this._model, post.id, pessoa)

        if (pessoaUnique)
            throw 'Pessoa já cadastradada!'

        
        try {
            await this.saveComplementos(post.id, post, pessoa.tipoPessoa, options)
        } catch (err) {
            if (utils.ObjectUtil.getValueProperty(data, 'isComplementoValidate') == false && utils.ObjectUtil.getValueProperty(err, 'name') == 'SequelizeValidationError') {
                //sem teste
            } else {
                return Promise.reject(err)
            }
        }






        return this._model.findByPk(post.id)


    }



    async getPessoasByMunicipioTipoPessoa(municipioId, type) {

        let param = []

        if(!type)
            _.union(param, ['cliente','fabrica','cedente','vendedor','agencia'])
        else
            param.push(type)

        let query = {
            include: relation().RelationPessoa(param),
        }



        query.include.filter(row => {

            if (row.as == 'enderecos')
                _.assign(row, { where: { municipioId: { [sequelize.Sequelize.Op.eq]: municipioId } }, separate: false, right: true, required: true })
        })


        return await sequelize.entity.Pessoa.findAll(query)




    }

    async getPessoaByTypeAndId(tipoPessoa, id){
        return await this.findOne({tipoPessoa, id})
    }


    async findOne(conditions = {}) {


        let where = {
            include: relation().RelationPessoa(),
            where: conditions
        }

        return await this._model.findOne(where)
    }

    async findAll(conditions) {

        let where = {
            include: relation().RelationPessoa()
        }

        if (conditions) {

            where = {
                where: conditions
            }
        }

        return await this._model.findAll(where)
    }



}


module.exports = PessoaModel