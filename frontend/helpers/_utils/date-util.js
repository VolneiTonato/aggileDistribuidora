class DateUtil {

    static format(str, format) {
        format = format || 'DD/MM/YYYY'
        if(str)
            return moment(str).format(format)
        return moment().format(format)
    }

    static formatToPtBR(str, timestamp = false){
        if(typeof str === 'string'){
            let data = str.substr(0, 10).split('-')

            let hora = ''


            if(timestamp)
                hora = ` ${str.substr(11,8)}`

            

            

            if(typeof data === 'object' && (data.length === 3))
                return `${data[2]}/${data[1]}/${data[0]}${hora}`
            else
                return str
            
        }else{
            return str
        }
    }

    static mesToNumber(numero) {

        let meses = [
            'Janeiro', 'Fevereiro', 'Março','Abril',
            'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro','Outubro',
            'Novembro', 'Dezembro'
        ]

        let mes = meses.filter( (element, idx) => {
            return ((idx + 1) == numero)
        })

        return mes
    }
}

module.exports = () => {
    return DateUtil
}