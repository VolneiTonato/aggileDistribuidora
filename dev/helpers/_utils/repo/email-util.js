const nodemailer = require('nodemailer')
const fs = require('fs')
const _ = require('lodash')




const transporterMail = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
        user: process.env.EMAIL_SEND,
        pass: process.env.EMAIL_PW
    }
})


const optionsEmail = {
    from: '',
    to: '',
    subject: '',
    text: '',
    html: ''
}





class EmailUtil {

    constructor() {

    }

    static template(pathFile, data) {
        
        return new Promise((resolve, reject) => {
            fs.readFile(`${__dirname}/../../../templates-email/${pathFile}.html`, (err, html) => {
                try {
                    if (err)
                        return reject(err)

                    let template = _.template(html)

                    return resolve(template(data))

                } catch (err) {
                    return reject(err)
                }
            })
        })
    }

    static send(options) {

        return new Promise((resolve, reject) => {
            try {

                transporterMail.sendMail(options, (err, info) => {
                    if (err)
                        return reject(err)

                    return resolve()
                })

            } catch (err) {
                return reject(err)
            }

        })
    }




}


module.exports = EmailUtil