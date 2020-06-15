const fs = require('fs')
const dateUtil = require('./date-util')
const cryptUtil = require('./crypt-util')

class LogUtil {
    
    static gravarLog(fileName, dados) {
        
        fs.appendFile(`./logs/${fileName}-${dateUtil.getMoment().format('DD-MM-YYYY')}.txt`, dados + "\n", (err) => {
            //if(err)
            //console.log(`Erro ao gravar log ${err}`)

            
        })

    }

    static gravarContingencia(fileName, folder, dados){
        fs.appendFile(`./contingencia/${folder}/${fileName}-${dateUtil.getMoment().format('DD-MM-YYYY')}-${cryptUtil.uniqueId()}.txt`, dados + "\n", (err) => {
            //if(err)
              //  console.log(`Erro ao gravar contingencia ${err}`)

            
        })
    }

}

module.exports = LogUtil
