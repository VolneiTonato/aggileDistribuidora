let shortid = require('shortid')
let sha1 = require('sha1')
let md5 = require('md5')
let stringUtil = require('./string-util')
let buffer = require('buffer')
let crypto = require('crypto')
let jwtModule = require('jwt-simple')
crypto.ra
const jwtKey = {
    authAdmin: '$5a*-+67*#DFJopasa{m.@)-ç{ª}G"`eR14#$%!+,_§@1!#$bbAXpxPY571d'
}



class CryptUtil {

    static KeysCrypt() {
        return {
            JWT: jwtKey.authAdmin
        }
    }


    static uuid() {
        let d = new Date().getTime()
        let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            let r = (d + Math.random() * 16) % 16 | 0
            d = Math.floor(d / 16)
            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16)
        })
        return uuid
    }



    static uniqueId() {
        return shortid.generate()
    }

    static encryptDadosBase64(text, key) {
        try {
            return this.base64Encode(jwtModule.encode(text, key))
        } catch (err) {
            throw err;
        }
    }



    static base64Encode(text) {
        try {
            return Buffer.from(text).toString('base64')
        } catch (err) {
            throw err.toString()
        }
    }

    static base64Decode(text) {
        try {
            return Buffer.from(text, 'base64').toString('ascii')
        } catch (err) {
            throw err.toString()
        }
    }


    static md5(text) {
        return md5(text)
    }

    static sha1(text) {
        return sha1(text);
    }


}

module.exports = CryptUtil