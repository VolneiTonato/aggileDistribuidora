const operationCalc = ( (value1, value2, operacao) => {
    
    value1 = NumberUtil.cdbl(value1)
    value2 = NumberUtil.cdbl(value2)


    let result = 0
    switch(operacao){
        case '+': 
            result = value1 + value2
            break
        case '-': 
            result = value1 - value2
            break
        case '/': 
            result = value1 / value2
            break
        case '*': 
            result = value1 * value2
            break
        case '%':
            result = value1 % value2
            break
        default: 
            result = 0
            break
    }

    return NumberUtil.cdbl(result)
})


class NumberUtil {

    static filter(value){
        if(typeof value === 'number')
            return value
        else if(typeof value === 'string')
            return value.replace(/\D/g, '')
        else
            return ''
    }

    static sum(value1, value2){
        return operationCalc(value1, value2, '+')
    }

    static diminuir(value1,value2){
        return operationCalc(value1, value2, '-')
    }

    static mod(value1,value2){
        return operationCalc(value1, value2, '%')
    }

    static divisao(value1, value2){
        return operationCalc(value1, value2, '/')
    }

    static multiplicacao(value1, value2){
        return operationCalc(value1, value2, '*')
    }


    static numberFormat(value, decimals, decPoint, thousandsSep) {

        value = (value + '').replace(/,/g, '.')
        value = (value + '').replace(/[^0-9+\-Ee.]/g, '')
        let n = !isFinite(+value) ? 0 : +value
        let prec = !isFinite(+decimals) ? 0 : Math.abs(decimals)
        let sep = (typeof thousandsSep === 'undefined') ? ',' : thousandsSep
        let dec = (typeof decPoint === 'undefined') ? '.' : decPoint
        let s = '';

        let toFixedFix = function (n, prec) {
            let k = Math.pow(10, prec)
            return '' + (Math.round(n * k) / k)
                .toFixed(prec)
        }

        // @todo: for IE parseFloat(0.55).toFixed(0) = 0;
        s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.')


        if (s[0].length > 3) {
            s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep)
        }
        if ((s[1] || '').length < prec) {
            s[1] = s[1] || ''
            s[1] += new Array(prec - s[1].length + 1).join('0')
        }

        return s.join(dec)
    }

    static isInt(value){
        return isFinite(parseInt(value))
    }


    static cInt(value){
        let aux = parseInt(value)

        if(!isFinite(aux))
            return Number(0)


        return Number(aux)
    }

    static cdbl(value){
        let aux = Number(value)

        if(!isFinite(aux))
            return Number(0.00)

        let number = Number(aux).toFixed(2)
        
        return Number(number)
    }


    static telefoneFormat(number){
        let aux = NumberUtil.filter(number)

        let tamanho = aux.length

        let fone = `(${aux.substr(0,2)})`

        if([10,11].indexOf(tamanho) === -1)
            return ''

        if(tamanho == 11){
            fone += `${aux.substr(2,5)}-${aux.substr(7,4)}`
        }else if(/([8-9])/.test(aux.substr(2,1)) && tamanho == 10){
            fone += `9${aux.substr(2,4)}-${aux.substr(6,4)}`
        }else{
            fone += `${aux.substr(2,4)}-${aux.substr(6,4)}`
        }
        
        return fone
    }

    static descontoRealToPercentual(valorTotal = 0, desconto = 0){
        if(valorTotal > 0 && desconto > 0)
            return  Math.abs((this.divisao(desconto, valorTotal) - 1) * 100)
        return 0
    }


    static calcularMargemLucro(custo, precoVenda) {

        return ((precoVenda - custo) / custo) * 100
    }

    static calcularVariacaoMaiorParaMenor(valorMaior, valorMenor){
        return ((valorMaior - valorMenor) / valorMaior) * 100
    }

    static calcularVariacaoMenorParaMaior(valorMaior, valorMenor){
        return ((valorMaior - valorMenor) / valorMenor) * 100
    }
    

    static decimalToPercentual(valorTotal = 0, desconto = 0){

        if(!valorTotal > 0 && !desconto > 0)
            return 0
        
        return this.calcularMargemLucro(desconto, valorTotal)

        
    }




    static percentualToDecimal(valorTotal, percentual, operacao = '+'){

        if(percentual <= 0 || valorTotal <= 0)
            return 0

        if(operacao == '+')
            return  this.cdbl(valorTotal) * (this.cdbl(percentual, 4) / 100)
        else if (operacao == '-')
            return  this.cdbl(valorTotal) * (this.cdbl(percentual , 4) / 100)
        else
            return 0
        
    }

    static calcularPercentual(valor, percentual, operacao = '+'){
        let number = 0


        valor = new Number(valor)

        percentual = new Number(percentual)

        if(operacao == '+')
            number = new Number(valor + (valor * (percentual / 100)))
        else if(operacao == '-')
            number = new Number(valor - (valor * (percentual / 100)))
        else
            return 0

        
        return number.toFixed(4).toString()
    }

    static percent(value, percent, operacao = '*') {
        let number = 1

        if (percent >= 100.0000) {

            if (/\./.test(percent)) {

                let numberSplit = percent.toString().split('.')
                number = parseInt(numberSplit[0].toString().substr(0, 1)) + 1
                number = parseFloat(`${number}.${parseInt(numberSplit[0].toString().substr(1, numberSplit[0].length))}${numberSplit[1]}`)
            } else {

                let n = parseInt(percent.toString().substr(0, 1)) + 1

                number = parseFloat(`${n}.${percent.toString().substr(1, percent.toString().length)}`)
            }

        } else {
            number = parseFloat(`${number}.${percent.toString().replace('.', '')}`)
        }

        
       

        let total = value * number
        try {

            if (/(\.)/.test(total)) {

                
                
                let round = total.toString().split('.')

                

                let decimal = round[1].toString().substr(0, 2)

                let upDown = 0

                if (!isNaN(parseInt(round[1].toString().substr(2, 1))))
                    upDown = Math.ceil(`0.${round[1].toString().substr(2, 1)}`)

                

                if(upDown > 0 && decimal == 99){
                    upDown = 0
                    decimal = '00'
                    round[0] = parseInt(round[0]) + 1
                }else {
                    decimal = parseInt(decimal) + parseInt(upDown)
                }

                total = `${round[0]}.${decimal}`


                

                return total
            }

        } catch (err) {
            return 0
        }


        if (operacao == '*')
            return value * number
        else if (operacao == '/') {
            return value / number
        }

    }

    
}

module.exports = NumberUtil
