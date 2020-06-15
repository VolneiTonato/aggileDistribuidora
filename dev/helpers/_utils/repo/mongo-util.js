const mongoose = require('mongoose')
const bluebird = require('bluebird')
const _ = require('lodash')

class MongoUtil {


    static erroValidation(err) {
        let msg = [];

        if (err.name == 'ValidationError') {

            for (let field in err.errors) {

                switch (err.errors[field].name) {
                    case 'CastError':
                        msg.push('Tipo inválido para o campo "' + field + '"!');
                        break;
                    case 'ValidatorError':
                        msg.push(err.errors[field].message);
                }
            }

        } else if (err.message) {
            msg.push(err.message);
        } else {
            msg.push(err.toString());
        }

        return msg.join('<br />');
    }

    static connection(dataBaseName, options = {}) {

        try {
            if (!dataBaseName)
                return undefined

            mongoose.Promise = bluebird


            _.assign(options, { useNewUrlParser: true, useUnifiedTopology: true })

            return mongoose.createConnection(`${this.urlMongoConnectionLocal()}/${dataBaseName}`, options)
        } catch (err) {

            return undefined
        }

    }

    static urlMongoConnectionLocal() {
        return process.env.MONGO_DB

    }
}
module.exports = MongoUtil