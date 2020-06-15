const Sequelize = require('sequelize')
const NumberUtil = require('./number-util')
const ObjectUtil = require('./object-util')
const async = require("async")

let _instances = {
    mysqlAggileDistribuidora: null

}

const connectionMysqlAggile = () => {

    if (!_instances.mysqlAggileDistribuidora) {
       
            try {
                _instances.mysqlAggileDistribuidora = new Sequelize(process.env.MYSQL_DATABASE, process.env.MYSQL_USER, process.env.MYSQL_PWD, {
                    host: process.env.MYSQL_HOST,
                    dialect: 'mysql',
                    dialectOptions: {
                        insecureAuth: true
                    },
                    logging: false,
                    pool: {
                        dle: 10000,
                        min: 0,
                        max: 5
                    }
                })
                
            } catch (err) {
                throw err
            }
    }

    return _instances.mysqlAggileDistribuidora
}


class MysqlUtil {




    static erroValidationSequelize(err) {
        let msg = []

        try {

            if (err.name == 'SequelizeValidationError') {

                err.errors.forEach((field) => {

                    msg.push(field.message)
                })

            } else if (err.name == 'SequelizeDatabaseError') {
                msg.push(err.message)

            } else if (err.name == 'SequelizeOptimisticLockError') {
                msg.push(err.message)
            } else if (ObjectUtil.hasProperty(err, 'ReferenceError')) {
                msg.push(err['ReferenceError'])
            } else if (err.message) {
                msg.push(err.message);
            } else {
                msg.push(err);
            }

            

            msg = msg.map(item => {

                
                if(/has invalid "undefined" value/ig.test(item))
                    item = 'Argumento inválido para a query!'
                return item
            })            

            return msg.join('<br />');

        } catch (err) {
            return err.toString()
        }
    }

    static validationDecimal(value, msg) {
        value = parseFloat(value)

        if (value === '')
            throw new Error(msg)
        if (isNaN(value))
            throw new Error(msg)

        return value
    }

    static setDecimalValue(value) {
        if (isNaN(parseFloat(value)))
            return 0.00
        return value


    }


    static validationInteger(value, msg) {
        value = NumberUtil.filter(value)

        if (value === '')
            throw new Error(msg)
        if (isNaN(parseInt(value)))
            throw new Error(msg)

        return value
    }
}


module.exports = MysqlUtil