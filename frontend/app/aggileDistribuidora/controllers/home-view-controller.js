const utils = require('../../../helpers/utils-site')


class HomeModel extends Backbone.Model {

    constructor() {
        super()
    }
}

class HomeView extends Backbone.View {

    constructor() {
        super()

        this._model = new HomeModel()

        this.$el = $('body')


        this.overrideEvents()
        this.render()
    }

    overrideEvents() {
        this.delegateEvents({
            "blur .input100": "blurInput100",
            "submit .validate-form": "submitForm"
        });

    }


    submitForm(e) {

        let check = true
        let _input = $('.validate-input .input100')


        for (let i = 0; i < _input.length; i++) {

            if (this.validate(_input[i]) == false) {
                this.showValidate(_input[i]);
                check = false
            }
        }

        if (_.get(navigator, 'onLine') !== true) {
            $.notify(`Atenção!! Seu dispositivo está sem internet no momento!`)

            e.preventDefault()
        }

        if (!check)
            e.preventDefault()
        else
            return true


    }

    blurInput100(e) {
        e.preventDefault()

        let element = $(e.currentTarget)

        if ($(element).val().trim() != "") {
            $(element).addClass('has-val');
        }
        else {
            $(element).removeClass('has-val');
        }


    }

    regraNegocioComponent() {
        $('.validate-form .input100').each((i, el) => {
            $(el).focus((row) => {
                this.hideValidate(row)
            })
        })

        setTimeout(() => {

            $.get('/obter-auth-validation').then(res => {
                if(res.login == false && res.message)
                    $.notify(`${res.message}`)
                else if(res.login == true && res.token)
                    document.location = '/admin'

            })
        }, 1000)
    }


    validate(input) {
        if ($(input).val().trim() == '')
            return false

    }

    showValidate(input) {
        let thisAlert = $(input).parent()

        $(thisAlert).addClass('alert-validate')
    }

    hideValidate(input) {
        let thisAlert = $(input).parent()

        $(thisAlert).removeClass('alert-validate')
    }

    async render() {

        await utils.UnderscoreUtil._template('#home-body-nav', {}, '#inner-content')

        this.regraNegocioComponent()

        return this
    }

}

module.exports.HomeView = () => {
    return new HomeView()
}

