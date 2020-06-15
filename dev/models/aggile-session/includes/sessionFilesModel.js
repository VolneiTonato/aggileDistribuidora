const mongoose = require('mongoose')
const utils = require('../../../helpers/_utils/utils')


let db

let connection = () => { db = utils.MongoUtil.connection('aggiledistribu01') }


class SessionFilesModel {

    constructor() {

        connection()

        db.on('error', (err) => {
            db.close()
            connection()
        })

        let schemaSessionAdmin = mongoose.Schema({
            data : {type: Array},
            type : {type: String},
            hash: {type: String},
            created : {type: Date, default: Date.now}
        }, { strict: false })

        

        this._model = db.model('session-aggile-files', schemaSessionAdmin)
    

        this._modelSessionMongo = db.model('session-aggile-files', schemaSessionAdmin)
    }


    fields() {
        return {
        }
    }

    instance() {
        return this._model;
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

    remove(param){
        return new Promise( (resolve, reject) => {
            try{

                this._model.findOne(param, (err, data) => {

                    if(data)
                        data.remove((err) => {
                            return resolve(true)
                        })
                    else
                        return resolve(true)
                })

                
            }catch(err){
                return reject(err)
            }
        })
    }

    save(param) {

        return new Promise((resolve, reject) => {
            try {
               // param.created = new Date()
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

module.exports = SessionFilesModel