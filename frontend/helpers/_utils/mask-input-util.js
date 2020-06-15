

const readyDocument = () => {
    let $body = $('body')

    $body.off('focus', '.integer, .currency, .percent .currency-4')

    $body.on('focus', '.integer, .currency, .percent, .currency-4', (e) => {
        $(e.currentTarget).select()
    })


    if ($body.find('.currency','.currency-4').length > 0) {
        $body.find('.currency', '.currency-4').each((idx, item) => {
            if ($(item).val() === '') {
                $(item).val('0.00').trigger('blur')
            }
        })
    }

    if ($body.find('.percent').length > 0) {


        $body.off('blur', '.percent')

        $body.on('blur', '.percent', (e) => {

            let value = $(e.currentTarget).val()
            value = parseFloat(value)

            if (value > 100) {
                $(e.currentTarget).val('0')
                $(e.currentTarget).select()
            }


        })

        $body.find('.percent').each((idx, item) => {

            if ($(item).val() === '')
                $(item).val('0').trigger('blur')


        })
    }

    if ($body.find('.integer').length > 0) {

        $body.find('.integer').each((idx, item) => {
            if ($(item).val() === '') {
                $(item).val('0').trigger('blur')
            }
        })

    }
}


class MaskInputUtil {

    static init() {
        $(document).ready(() => {
            this.mask()
        })
    }

    static mask() {

        readyDocument()

        if ($('.date-mask').length > 0)
            $(".date-mask").inputmask("99/99/9999", { clearIncomplete: true })


        if ($('.datetime-mask').length > 0)
            $(".datetime-mask").inputmask("99/99/9999 99:99", { clearIncomplete: true })

        if ($('.phone-mask').length > 0)
            $(".phone-mask").inputmask("(99)9999[9]-9999", { clearIncomplete: true })

        if ($('.cep-mask').length > 0)
            $(".cep-mask").inputmask("99999-999", { clearIncomplete: true })

        if ($('.cnpj-mask').length > 0)
            $(".cnpj-mask").inputmask("99.999.999/9999-99", { clearIncomplete: true })


        if ($('.cpf-mask').length > 0)
            $(".cpf-mask").inputmask("999.999.999-99", { clearIncomplete: true })

        if ($(".currency").length > 0) {

            $(".currency").inputmask('currency',
                { prefix: '', digits: 2, integerDigits: 10, rightAlign: false, groupSeparator: '', radixPoint: '.' }
            );
        }
        if ($(".currency-4").length > 0) {

            $(".currency-4").inputmask('currency',
                { prefix: '', digits: 4, integerDigits: 3, rightAlign: false, groupSeparator: '', radixPoint: '.' }
            );
        }

        if ($(".percent").length > 0) {
            $('.percent').priceFormat({
                prefix: '',
                thousandsSeparator: '',
                limit: '5'
            });
        }

        if ($(".integer").length > 0) {
            $('.integer').priceFormat({
                prefix: '',
                thousandsSeparator: '',
                limit: '5',
                centsLimit: '0'
            });
        }

    }



}


module.exports = () => {
    MaskInputUtil.init()
    return MaskInputUtil
} 