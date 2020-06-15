const path = require('path')
const fs = require('fs')


let pathPublic = `${__dirname}/../../../public`

class DirectoryUtil {


    static fileExists(pathString){
        return new Promise((resolve, reject) => {
            fs.access(pathString, fs.F_OK, err => {
                resolve(!err)
            })
        })
    }

    static createRecursive(pathString) {
        try {
            
            if (/(\/)/ig.test(pathString)) {
                let auxDados = pathString.split('/')

                let stringAuxPath = pathPublic

                auxDados.forEach((dir) => {
                    if (dir !== '') {
                        
                        stringAuxPath += '/' + dir

                        
                        
                        if (!fs.existsSync(stringAuxPath))
                            fs.mkdirSync(stringAuxPath)
                    }
                })

            } else {
                if (!fs.existsSync(`${pathPublic}/${pathString}`))
                    fs.mkdirSync(`${pathPublic}/${pathString}`)
            }
        } catch (err) {
            
        }
    }
}

module.exports = DirectoryUtil