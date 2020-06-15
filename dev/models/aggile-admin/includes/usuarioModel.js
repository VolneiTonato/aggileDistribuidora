const sequelize = require('./entityes/index')
const utilModel = require('../extras/utils-model')
const enums = require('./enuns/enum')
const utils = require('../../../helpers/_utils/utils')


const validatePassordAndConfirmPasswor = (data = {}) => {
    return data.password === data.confirmarSenha
}


class UsuarioModel {

    constructor() {
        this._model = sequelize.entity.Usuario

        this._model.hasOne(sequelize.entity.Vendedor, {foreignKey: 'usuarioId', sourceKey : 'id', through: 'vendedor'})
    }

    enumsPermissoes() {
        return enums.EnumPermissaoUsuario
    }


    async findAll(conditions = {}){
        let where = {}

        if(conditions.usuarioLogado)
            delete conditions.usuarioLogado

        if (conditions) {

            where = {
                where: conditions,
                include : [{
                    model : sequelize.entity.Vendedor,
                    require: false
                }]
            }
        }

        return await this._model.findAll(where)
        

    }


    async findOne(conditions = {}) {

        if(conditions.usuarioLogado)
            delete conditions.usuarioLogado

        let where = {
            where: conditions,
            include : [{
                model : entity.Vendedor,
                require: false
            }]
        }

        return await this._model.findOne(where)
    }


    async newUserRamdon(nome, permissoes = [], options){
        let user = new sequelize.entity.Usuario()

        let password = utils.CryptUtil.uniqueId()
        user.nome = nome
        user.permissao = permissoes
        user.login = utils.CryptUtil.uniqueId()
        user.password = password
        user.confirmarSenha = password
        
        
        let [err,success] = await utils.PromiseUtil.to(user.save(options))

        if(err)
            throw err

        success.passwordTextplain = password
        
        return success
        
    }



    async createOrUpdate(data) {


        if (data.id) {

            let userExistente = await this._model.findByPk(data.id)

            if (!userExistente)
                throw "Usuário inválido!"

            let user = utilModel.LoadModelToFormUtil.load(userExistente, data)

            delete user.password
            user.login = userExistente.login

            await user.save({ validate: true })

            return user

        } else {

            if (!validatePassordAndConfirmPasswor(data))
                throw "As duas senhas devem ser iguais!"

            let user = utilModel.LoadModelToFormUtil.load(new sequelize.entity.Usuario(), data)

            user.login = data.nome

            return await user.save({ validate: true })
        }
    }

}


module.exports = UsuarioModel