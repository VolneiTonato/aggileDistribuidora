let objectUtil = require('./object-util')
const js2xmlparser = require ('js2xmlparser')
const mysqlUtil = require('./mysql-util')

class ResponseUtil{

    constructor(){
        this._format = 'json'
    }

    static instance(){
        if(this._instance == undefined)
            this._instance = new ResponseUtil()
        return this._instance
    }

    format(req){

        try{


            let _format = objectUtil.get(req.query,'_format')

            if(_format == undefined)
                _format = objectUtil.get(req.body, '_format')

            if(['xml', 'json'].indexOf(_format) == -1)
                return this._format
            
            return _format


        }catch(e){
            return this._format
        }
    }

    responseErrorMessage(err){

        
        return mysqlUtil.erroValidationSequelize(err)
    }

    /**
     * 
     * @param {res: Response , message: string, param: Array Object, format: string, code: integer, type: [success, info, warning, error]} options
     */
    response(options){
        try{

            options.param = options.param || []
            options.code = options.code || 200
            options.format = options.format || this._format
            options.type = options.type || 'success'
            options.status = options.status == undefined ? true : false
            options.message = options.message || ''

            
            
            let result = {
                message : options.message,
                retorno : options.param,
                status : options.status,
                type : options.type,
                code : options.code,
                format : options.format
            }

            //; charset=utf-8
            if(options.format == 'json'){
                options.res.set("Content-Type",'application/json')
                return options.res.status(options.code).json(result)
            }else if(options.format == 'xml'){
                options.res.set("Content-Type",'application/xml')
                return options.res.send( js2xmlparser.parse('root', result) )
            }

        }catch(e){
            return options.res.status(500).send(e)
        }
    }

}

module.exports  = ResponseUtil