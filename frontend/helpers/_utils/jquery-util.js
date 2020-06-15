class JqueryUtil {

    static init() {
        this.jqueryQueue()
        this.initializeComponentesJquery()
    }

    static initClickRefreshUrlBackbone() {

        $('body .link-navegacao').off('click').on('click', (e) => {

            let url = ($(e.currentTarget).attr('href') || $(e.currentTarget).attr('data-attr') || '').replace('#', '')

            let fragmentBackbone = decodeURIComponent(Backbone.history.getFragment())

            if (!url){
                $('body select option[class="link-navegacao"]').each((i, item) => {
                    let currentDescricao = $(e.currentTarget).text().replace(/^\s+->\s+/, '')

                    if (currentDescricao == item.text)
                        url = $(item).attr('data-attr').replace('#', '')
                })
                
                fragmentBackbone = url
                window.location.hash = url
            }else{
                try{
                    $('.selectpicker').selectpicker('val', '')
                    $('.selectpicker').selectpicker('render')
                }catch(err){}
                fragmentBackbone = url
                window.location.hash = url
            }
            

            if (url ===  fragmentBackbone)
                Backbone.history.loadUrl(fragmentBackbone)

        })
    }

    static initializeComponentesJquery() {

        if (/(admin|reports)/ig.test(location.href)) {
            this.select2()
            this.optionsBox()
            this.datePicker()
            this.statusPrint()
            this.googleMapsModal()
            this.ckeditor()
            this.initClickRefreshUrlBackbone()

            if(/(admin)/ig.test(location.href))
                this.upperCaseText()
            
            
        }


   }

   

    
    static googleMapsModal(){

        $('body').find('button.google-maps').off('click')
        $('body').find('button.google-maps').on('click', async (e) => {

            try{
            
                let data = $(e.currentTarget).attr('data-position')

                
            
            
                if(data.length == 0)
                    return false

                let modalUtil = require('./modal-util')()


                let windowHeight = $(window).innerHeight()


                let modal = await modalUtil.modalVTT(`<iframe height="${windowHeight}px" width="99%" src="https://www.google.com/maps/embed/v1/place?key=AIzaSyCWXpA2wlEcchUzNxJdJFuNnuDCqZLh-l4&q=${data}&zoom=18"></iframe>`,'GOOGLE MAPS', {buttonClose : true})

                $(modal.element).dialog(modal.config).dialog('open')

            }catch(err){
                
            }
        })
    }

    static ckeditor(){
        if($('.editor-ckeditor').length > 0){
            $('.editor-ckeditor').each((i, item) => {
                let id = $(item).attr('id')
                if(id)
                    CKEDITOR.replace(`${id}`, { })
            })
            


        }
    }

    
    static upperCaseText() {
        $('body').find('input[type="text"]').off('blur')

        $('body').find('input[type="text"]').on('blur', (item) => {

            let data = $(item.currentTarget)

            try {
                data.val(data.val().toString().toUpperCase())
            } catch (err) {
                try {
                    data.text(data.text().toString().toUpperCase())
                } catch (err) {


                }
            }
        })
    }


    static rodapeBaseSite() {

        $(document).ready(($) => { resize() })

        $(document).resize((event) => { resize() })

        let resize = () => {

            $('footer')[0].style.setProperty('margin-top', `0px`, 'important')

            let footerHeight = $('footer').outerHeight(true, true)

            let windowHeight = $(document).outerHeight(true, true)

            let headerHeight = parseFloat($('header').outerHeight(true, true)) + parseFloat($('body .container:eq(0)').outerHeight(true, true)) + parseFloat($('#inner-content').outerHeight(true, true))

            let HeightBodyAndFooter = headerHeight + footerHeight

            let marginTop = 0

            if (windowHeight > HeightBodyAndFooter)
                marginTop = windowHeight - HeightBodyAndFooter + 21
            else
                marginTop = windowHeight - headerHeight + footerHeight

            if ((parseInt(windowHeight) - parseInt(headerHeight)) > parseInt(footerHeight))
                $('footer')[0].style.setProperty('margin-top', `${parseInt(marginTop)}px`, 'important')


        }


    }

    static showHideComponent(element){
        return new (require('./includes/jquery/show-hide-component'))(element)
    }



    static jqueryQueue() {

        (function ($) {

            var ajaxQueue = $({})
            $.ajaxQueue = function (ajaxOpts) {

                var oldComplete = ajaxOpts.complete;

                ajaxQueue.queue(function (next) {

                    ajaxOpts.complete = function () {

                        if (oldComplete) oldComplete.apply(this, arguments)
                        next()
                    }


                    $.ajax(ajaxOpts)
                })
            }

        })(jQuery)
    }

    static datePicker(element = '.datapicker') {

        if ($(element).length > 0) {
            $(element).datepicker({
                autoclose: true
            })

            $.datepicker.regional['pt-BR'] = {
                closeText: 'Fechar',
                prevText: '&#x3c;Anterior',
                nextText: 'Pr&oacute;ximo&#x3e;',
                currentText: 'Hoje',
                monthNames: ['Janeiro', 'Fevereiro', 'Mar&ccedil;o', 'Abril', 'Maio', 'Junho',
                    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
                monthNamesShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
                    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
                dayNames: ['Domingo', 'Segunda-feira', 'Ter&ccedil;a-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sabado'],
                dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'],
                dayNamesMin: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'],
                weekHeader: 'Sm',
                dateFormat: 'dd/mm/yy',
                firstDay: 0,
                isRTL: false,
                showMonthAfterYear: false,
                yearSuffix: ''
            };
            $.datepicker.setDefaults($.datepicker.regional['pt-BR']);
        }
    }

    static select2(element = '.select2') {

        if ($(element).length > 0) {
            $(element).select2({
                theme: 'bootstrap',
                width: null,
                //containerCssClass: ':all:',
                //dropdownCssClass: "increasedzindexclass"
            })
            $.fn.select2.defaults.set("theme", "bootstrap")
        }
    }

    static statusPrint() {
        $('body').find('.status-print').each((i, item) => {
            let text = $(item).text()
            let color = ''

            if (/(cancelado|cancelada)/ig.test(text))
                color = 'danger'
            else if (/(lancado|lancada|pago|paga)/ig.test(text))
                color = 'success'
            else if (/pentende/ig.test(text))
                color = 'warning'
            else if (/entregue/ig.test(text))
                color = 'info'

            $(item).parents().addClass(color)
        })
    }

    static optionsBox(element = '.box') {
        try {
            if ($(element).length > 0) {
                $(element).each(function () {
                    $.fn.boxWidget.call($(this))
                })
            }
        } catch (err) {

        }
    }


    static scrollAjax(element, options = {}, callback) {

        $(window).unbind('scroll')

        $(window).scroll(() => {


            if ($('body').find(element).length == 0)
                return

            if (($(window).innerHeight() + $(window).scrollTop()) >= $("body").height())
                callback()


        })

    }


    static scroll() {

        $(window).unbind('scroll')


        $(window).scroll((e) => {



            try {

                if ($(e.currentTarget).scrollTop() > $(window).height() / 2) {
                    $('#back-to-top').fadeIn(300)
                } else {
                    $('#back-to-top').fadeOut(300)
                }

            } catch (err) {

            }

        })


        $('#back-to-top').click((e) => {
            e.preventDefault()

            let page = $('html, body')

            try {

                /*
                page.on("scroll mousedown wheel DOMMouseScroll mousewheel keyup touchmove", () => {
                    page.stop()
                })


                */
                page.animate({
                    scrollTop: 0,

                }, 800, () => {
                    // page.off("scroll mousedown wheel DOMMouseScroll mousewheel keyup touchmove")
                })

                //page.stop()

            } catch (err) {

            }
        })


    }
}


module.exports = () => {
    JqueryUtil.init()
    return JqueryUtil
} 