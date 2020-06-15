const mongoose = require('mongoose')
const utils = require('../../../helpers/_utils/utils')


let db

let connection = () => { db = utils.MongoUtil.connection(process.env.DATABASE_MONGODB) }


class SessionAdminModel {

    constructor() {

        connection()

        db.on('error', (err) => {
            db.close()
            connection()
        })

        let schemaSessionAdmin = mongoose.Schema({}, { strict: false })

        

        this._model = db.model('session-aggile-token', schemaSessionAdmin)
    

        this._modelSessionMongo = db.model('session-aggile-admin', schemaSessionAdmin)
    }


    fields() {
        return {
        }
    }

    instance() {
        return this._model;
    }

    removeToToken(token) {
        return new Promise((resolve, reject) => {
            try {

                this._modelSessionMongo.deleteOne({'session.adminAggile.tokenAccess' : `"${token}"`})


                this._model
                    .deleteOne({ 'tokenAccess' : token }, (err) => {
                        return resolve()
                    })


            } catch (err) {
                return resolve()
            }
        })
    }

    obter(param) {
        return new Promise((resolve, reject) => {
            try {
                this._model
                    .findOne(param)
                    .exec((err, result) => {
                        if (err)
                            return reject(err)

                        return resolve(JSON.parse(JSON.stringify(result)))
                    })
            } catch (err) {
                return reject(err)
            }
        })
    }

    save(param) {

        return new Promise((resolve, reject) => {
            try {
                (new this._model(param))
                    .save((err, retorno) => {
                        if (err)
                            return reject(Utils.MongoUtil.erroValidation(err))

                        return resolve(retorno)
                    })
            } catch (err) {
                return reject(err)
            }
        })


    }
}

module.exports = SessionAdminModel