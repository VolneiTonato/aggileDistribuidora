let moment = require('moment')


const momentCallback = (str, format) => {
    return moment(str, format).utcOffset('-0300')
}

class DateUtil {

    static date() {
        return new Date(momentCallback().format());
    }

    static getInstanceMoment() {
        return moment
    }

    static momentToPug(str, format) {
        try {
           // return moment.tz(new Date(str), 'America/Sao_Paulo').utcOffset('-0300').format(format)
           if(!DateUtil.isValid(new Date(str), format))
                return ''
           return moment(new Date(str)).format(format)          

        } catch (err) {
            return str
        }
    }

    static getMoment(str, format) {
        try {
            return momentCallback(str, format)
        } catch (err) {
            return undefined;
        }
    }

    static getStringDateAndTime() {
        try {

            let data = moment()

            data.utcOffset('-0300')

            return data.format('DD/MM/YYYY HH:mm:ss')
        } catch (err) {
            return ''
        }
    }

    static subDay(day, timestamp) {
        return new Date(momentCallback().subtract(day, 'days').format('MM/DD/YYYY'.concat(timestamp !== "" ? " HH:mm:ss" : "")));
    }

    static formatTime(textTime) {
        let date = new Date(textTime);
        let hour = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
        let minute = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
        let second = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();

        return hour + ':' + minute + ':' + second;
    }


    static formatToPtBR(txtDate) {

        if (typeof txtDate === 'string') {
            let data = txtDate.substring(0, 10).split('-')

            if (typeof data === 'object' && (data.length === 3))
                return `${data[2]}/${data[1]}/${data[0]}`
            else
                return txtDate

        } else {
            return txtDate
        }

    }

    static isValid(txtDate, format = 'DD/MM/YYYY') {

        if(txtDate == undefined)
            return false

        if(/(\/)/.test(txtDate))
            txtDate = this.formatPtbrToUniversal(txtDate)

        let isValid = moment(txtDate, format, true).isValid()

        if(!isValid)
            return moment(new Date(txtDate), format, true).isValid()
        return true

    }

    /**
     * 
     * @param {*} txtDate 
     * @param {*} isDateInicial 
     * @param {*} isTimesTamp 
     */
    static betweenFormatQuery(txtDate, isDateInicial = true,  isTimesTamp = true){
        let stringDate = this.formatPtbrToUniversal(txtDate)

        if(isTimesTamp)
            return `${stringDate}${isDateInicial == true ? ' 00:00:00' : ' 23:59:59'}`
        return `${stringDate}`
    }


    static formatPtbrToUniversal(txtDate) {

        try {

            if (!/(\/)/ig.test(txtDate))
                return txtDate

            let aux = txtDate.split('/')

            let stringFormat = `${aux[2].substr(0, 4)}-${aux[1]}-${aux[0]}`


            return stringFormat

        } catch (ex) {
            return new Date()
        }


    }


}

module.exports = DateUtil