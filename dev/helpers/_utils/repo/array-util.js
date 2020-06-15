const _ = require('lodash')
const ObjectUtil = require('./object-util')


class ArrayOrderByLodash {

    static genrows(groups, groupKey) {
        return _.toPairs(groups)
            .map(([key, data]) => ({ [groupKey]: key, data }))
    }

    static gengroups(arr, iteratee, key) {
        const grouped = _.groupBy(arr, iteratee)
        return this.genrows(grouped, key)
    }

    /**
     * @typedef {Object} GroupByProp
     * @prop {String=} key Grouping key
     * @prop {String|Function} iteratee An iteratee for Lodash's groupBy
     */

    /**
     * Group collection's data by multiple iteratees
     * @param data
     * @param {Array<String|GroupByProp>} props Array of group by objects or property names
     *   This parameter also can contain both property names and group by objects together
     * @returns {Array}
     */

    static grouparray(data, props) {
        let result = [{ data }]

        props.forEach((prop, i) => {
            const key = prop.key || `k${i + 1}`
            const iteratee = prop.iteratee || prop

            result = _.flatten(result.map(row => {
                return this.gengroups(row.data, iteratee, key)
                    .map(group => Object.assign({}, row, {
                        [key]: group[key],
                        data: group.data
                    }))
            }))

        })

        return _.flatten(result)
    }
}



const groupByRef = () => {

}



class ArrayUtil {

    constructor() {

    }

    static groupByArray(list = [], groupByIter = []) {
        if (!_.isArray(groupByIter))
            return _.groupBy(list, groupByIter)

        return _.groupBy(list, function (o) {

            let data = []

            let values = _.map(groupByIter, function (k) {

         
                if (_.isArray(k)) {
                    let valuesInner = _.map(k, function (x) {
                        
                        return ObjectUtil.getValueProperty(o, x)
                    })

                    return valuesInner.join(',')

                } else {

                    return ObjectUtil.getValueProperty(o, k)
                }
            })


            
            values = values.map( (item, i)  => {

                if(item == ',')
                    item = item.toString().replace(',', '')

                /*
                if(/,/.test(item)){
                    item.toString().split(',').forEach( x => {
                        
                    })                    
                }*/
                return item
            })
            
            return _.find(_.compact(values))
        })
    }

    static arrayPlanilhaGoogleToJson(rows) {
        try {
            let columns = rows[0]
            let col = 0
            let row = columns.length
            let values = []

            let auxName = ''

            for (let i = 1; i < rows.length; i++) {
                let data = {}

                for (let j = 0; j < row; j++) {
                    auxName = columns[j]

                    data[auxName] = rows[i][j]
                }
                values.push(JSON.parse(JSON.stringify(data)))
            }

            return values

        } catch (err) {
            throw err
        }
    }

    static createArrayInteger(number){
        let data = []
        for(let i = 1; i <= number; i++)
            data.push(i)
        
        return data
    }


    static length(data = []){
        try{
            if(ObjectUtil.getValueProperty(data, 'length'))
                return data.length
            return 0
            
        }catch(err){
            return 0
        }
    }
}

module.exports = ArrayUtil