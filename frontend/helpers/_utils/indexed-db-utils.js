const async = require('async')
const DexieUtil = require('./includes/dexie/dexie-utils')

const include = {
    objectUtil: require('./object-util')()
}



const where = (obj, stack, data = [], table = {}) => {

    for (let property in obj) {

        if (obj.hasOwnProperty(property)) {

            if (typeof obj[property] == "object") {

                if (stack !== undefined)
                    where(obj[property], `${stack}.${property}`, data, table)
                else
                    where(obj[property], `${property}`, data , table)
            } else {


                if (!include.objectUtil.is(obj, `${property}`))
                    continue

                let persistProp = Object.getOwnPropertyNames(table)

                if (stack !== undefined) {


                    if (/(\.)/ig.test(stack)) {
                        let props = stack.split('.')

                        if(persistProp.indexOf(`${props[0]}.${props[1]}.${property}`) === -1)
                            continue

                        data.push(`${props[0]}.${props[1]}.${property}:${obj[property]}`)

                    } else {

                        if(persistProp.indexOf(`${stack}.${property}`) === -1)
                            continue

                        data.push(`${stack}.${property}:${obj[property]}`)
                    }




                } else {

                    if(persistProp.indexOf(`${property}`) === -1)
                        continue

                    data.push(`${property}:${obj[property]}`)
                }
            }
        }
    }

    return data
}


class IndexedDbAdmin {



    static async save(table, data) {

        let cnn = await this.conexao()

        return await cnn[table].put(data)
    }

    static async findOne(table, where = {}) {
        let data = await this.findAll(table, where)

        if (_.isArray(data))
            return data[0]
        return {}
    }

    static async where(tableName , data = {}) {
        

        let table = await this.getClass(tableName)
        
        let itens =  where(data, undefined,undefined, table)

    

        let condition = {}

        itens.forEach( (r ) => {
            let aux = r.split(':')

            let format = parseFloat(aux[1])

            condition[`${aux[0]}`] = isNaN(format) ? aux[1] : format

        })

        return await condition
    }

    static async findAll(table, where = {}) {
        let cnn = await this.conexao()

        if (Object.getOwnPropertyNames(where).length > 0)
            return await cnn[table].where(where).toArray()

        return await cnn[table].toArray()
    }

    static async conexao() {
        let cnn = await DexieUtil.db({ getConnection: true })

        return cnn.db
    }

    static async getClass(tableName) {
        let cnn = await this.conexao()

        try {
            let table = cnn.table(tableName)

            if (!table)
                throw 'Table not found'

            return table.schema.idxByName


        } catch (err) {
            throw err
        }
    }


    static async asyncServerToApp(options = {}) {
        return await DexieUtil.runAsyncServerToApp(options)

    }

    static async asyncLocalToServer(){
        
    }

}


module.exports = () => { return IndexedDbAdmin }