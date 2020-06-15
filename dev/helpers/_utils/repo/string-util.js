let lzString = require('lz-string')
let utilsNode = require('util')
let _ = require('lodash')

class StringUtil {
    static compress(text) {
        return lzString.compressToUTF16(text)
    }

    static decompress(compress) {
        return lzString.decompressFromUTF16(compress)
    }


    static decompressAsync(text) {
        return new Promise((resolve, reject) => {
            try {
                return resolve(lzString.decompressFromUTF16(text))
            } catch (err) {
                return reject(err)
            }
        })
    }


    static compressAsync(text) {
        return new Promise((resolve, reject) => {
            try {
                return resolve(lzString.compressToUTF16(text))
            } catch (err) {
                return reject(err)
            }
        })
    }

    static consoleLog(text, file, line) {
        try {
            console.log(`Error in ${file} line: ${line} -> ${text}`)
        } catch (err) {
            console.log(`Erro ao mostrar erro -> ${err}`)
        }
    }

    static utilsNode() {
        return utilsNode
    }


    static iniFile(dados) {
        try {
            let aux = dados.split('\r\n')
            let x

            let data = []

            for (let i = 0; i <= aux.length; i++) {
                if (/(=)/g.test(aux[i])) {
                    x = aux[i].split('=')
                    data[trim(x[0])] = trim(x[1])
                }
            }
            return data
        } catch (e) {
            return undefined
        }
    }


    static stringToBool(value = false){

        if(/^(true)$/ig.test(value))
            return true
        
        if(/^(false)$/ig.test(value))
            return false

        if(/^(ativo)(|s)$/ig.test(value))
            return true

        if(/^(inativo)(|s)$/ig.test(value))
            return false

        return value === true
        
    }

    static boolToString(value = false){
        let b = StringUtil.stringToBool(value)

        return b === true ? 'SIM' : 'NÃO'
    }

    static toUpperCase(value = ''){
        try{
            
            return value.toUpperCase()
        }catch(err){
            return ''
        }
    }

    static toLowerCase(value = ''){
        try{
            return value.toLowerCase()
        }catch(err){
            return ''
        }
    }

}


module.exports = StringUtil