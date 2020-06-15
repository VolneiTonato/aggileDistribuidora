const utils = require('../../../../helpers/_utils/utils')
const cron = require('node-schedule')
const _ = require('lodash')
const async = require('async')
const request = require('request')




module.exports = () => {

    const taskOnly = () => {
        //request.get({url:'https://aggile-distribuidora.herokuapp.com'})
    }

    

    let job = cron.scheduleJob("*/25 * * * *", () => { 

        let hour = parseInt(utils.DateUtil.getMoment().format('HH'))

        if(hour >= 22)
            job.cancel()
        else if(hour >= 0 && hour <= 8)
            job.cancel()
        else
            taskOnly() 
    })
    
}