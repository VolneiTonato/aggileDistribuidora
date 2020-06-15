const ObjectUtil = require('./object-util')()
const MobileUtil = require('./mobile-util')()

class MessageUtil {

    static messageVTT(mensagem, cType, options = {}) {
        let $deferred = $.Deferred();
        try {

            let hash = Math.floor(Math.random() * 1000000)

            if (options.ssid)
                hash = options.ssid


            setTimeout(() => {

                let template = _.template($('#template-message').html())

                $('body').find(`#bloco-message-vtt-${hash}`).remove()

                $("body").append(template({ hash: hash, title: 'AGGILE DISTRIBUIDORA', message: mensagem, type: cType }))


                setTimeout(() => {
                    let key = `#bloco-message-vtt-${hash}`
                    let send = {
                        element: key,
                        config: {
                            key: key,
                            draggable: false,
                            closeOnEscape: false,
                            width: MobileUtil.isMobile() ? '98%' : '50%',
                            resizable: false,
                            //zIndex: 99998,
                            modal: true,
                            beforeClose: function (event, ui) {
                                $("#overlay-dialog").hide()
                                //$("body").css({ overflow: 'inherit' })

                            },
                            open: function (e, ui) {
                                //$("#overlay-dialog" ).show()
                                $(send.element).css('overflow', 'hidden');
                                $(".ui-dialog-titlebar-close").hide();
                            },
                            close: function (e, ui) {
                                try {
                                    $(e.currentTarget).dialog('destroy')
                                } catch (err) {

                                }finally{
                                    $('body').find(`#${$(e.target).prop('id')}`).remove()
                                }
                            }
                        }

                    }
                    return $deferred.resolve(send);
                }, 100);
            }, 100);

        } catch (err) {
            return $deferred.reject(err);
        }

        $deferred.then(function (response) {

        });


        return $deferred.promise();
    }


    static async messageLoader(message, cType, options) {

        let r = await this.messageVTT(message, cType)

        _.extend(r.config, options)

        $(r.element).dialog(r.config).dialog('open')

        return r
    }


    static async alert(message, cType = 'info', options = {}) {

        


        if(_.get(message, 'message'))
            message = message.message
      
        


        let r = await this.messageVTT(message, cType, options)

        _.extend(r.config, options, {
            buttons: {
                'Fechar': function () {
                    $(this).dialog("close");

                }
            }
        })
        


        $(r.element).dialog(r.config).dialog('open')

        return r
    }



    static async message(message, cType, options = {}) {


        let r = await this.messageVTT(message, cType, options)

        if (Object.getOwnPropertyNames(options).length == 1 && options.ssid)

            _.extend(r.config, options, {
                buttons: {
                    'Fechar': function () {
                        $(this).dialog("close");

                    }
                }
            })
        else
            _.extend(r.config, options)


        $(r.element).dialog(r.config).dialog('open')

        return r
    }

    static closeButton(event, id) {
        if (id) {
            $(`#${id}`).dialog('close')
        } else {
            let id = $(event.currentTarget).closest('div.ui-dialog').attr('aria-describedby')
            $(`#${id}`).dialog('close')
        }
    }

    static async error(message, options) {

        let msg = ''

        try {



            if (ObjectUtil.isObject(message)) {



                if (ObjectUtil.hasProperty(message, 'responseJSON')) {

                    if (ObjectUtil.hasProperty(message.responseJSON, 'logado') && (message.responseJSON.logado == false))
                        return location.href = "/admin/auth"



                }

                if (ObjectUtil.hasProperty(message, 'message') && (message.message !== '')) {
                    throw message
                } else if (ObjectUtil.hasProperty(message, 'responseJSON')) {
                    if (ObjectUtil.hasProperty(message.responseJSON, 'message') && (message.responseJSON.message != ''))
                        msg = message.responseJSON.message
                }



                if (msg == '') {

                    if (ObjectUtil.hasProperty(message, 'responseText') && (message.responseText != '')) {
                        try {
                            let msgAux = JSON.parse(message.responseText)

                            if (ObjectUtil.hasProperty(msgAux, 'message'))
                                msg = msgAux.message
                            else
                                msg = message.statusText
                        } catch (err) {
                            msg = message.statusText
                        }
                    } else {
                        msg = message.statusText
                    }

                }

            } else {
                msg = message
            }

        } catch (err) {
            if (typeof err == 'object') {
                msg = `${err.toString()}`
            } else {
                msg = err
            }
        }

        if (msg == '')
            msg = 'Ocorreu um erro na comunicação o servidor! Atualize a página e tente novamente.'

        let r = await this.messageVTT(msg, 'danger')



        _.extend(r.config, options, {
            buttons: {
                'Fechar': function () {
                    $(this).dialog("close");

                }
            }
        })

        $(r.element).dialog(r.config).dialog('open')

        return r
    }

}

module.exports = () => {
    return MessageUtil
}
