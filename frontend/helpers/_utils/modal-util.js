const ObjectUtil = require('./object-util')()
const jquertUtil = require('./jquery-util')()
const maskedUtil = require('./mask-input-util')()
const mobileUtil = require('./mobile-util')()

class ModalUtil {


    static closeButton(event, id) {
        if (id) {
            $(`#${id}`).dialog('close')
        } else {
            let id = $(event.currentTarget).closest('div.ui-dialog').attr('aria-describedby')
            $(`#${id}`).dialog('close')
        }
    }


    static forceCloseButton(id) {
        try {
            if (id) {
                $(`${id}`).dialog('close')
            } else {
                let id = $('div.ui-dialog').attr('aria-describedby')
                $(`${id}`).dialog('close')
            }
        } catch (err) {

        }
    }

    static async loaderPage(message = 'Aguarde...') {
        let template = _.template($('#template-loader-fech').html())

        let modal = await this.modalVTT(template({ message: message, type: 'default' }), '', { isCloseX: false, width: '500px' })

        $(modal.element).dialog(modal.config)

        return modal

    }

    static eventObserver() {


        try {

            this._observerResize = new ResizeObserver(entries => {

                for (let entry of entries) {
                    let cs = window.getComputedStyle(entry.target)

                    let csDimensao = () => {
                        return {
                            h: parseFloat(cs.height.replace('px', '')),
                            b: parseFloat(cs.bottom.replace('px', '')),
                            t: parseFloat(cs.top.replace('px', ''))
                        }
                    }

                    if (csDimensao().b < 0) {
                        entry.target.style.top = 0

                        if (csDimensao().b < 0)
                            entry.target.style.height = window.innerHeight
                    }

                }
            })

        } catch (err) {

        }


    }



    static modalVTT(html, title, options = {}) {
        let $deferred = $.Deferred()

        try {

            let hash = Math.floor(Math.random() * 1000000)
            title = title || 'AGGILE DISTRIBUIDORA'

            let iframe = undefined


            if (options.elementHtml != undefined)
                hash = options.elementHtml


            if(_.isObject(options.iframe)){
                iframe = {
                    src : options.iframe.src,
                    width: options.iframe.width,
                    height: options.iframe.height
                }
            }



            if ($(`#bloco-modal-vtt-${hash}`).length > 0) {
                try {
                    $(`#bloco-modal-vtt-${hash}`).dialog('destroy')
                    $(`#bloco-modal-vtt-${hash}`).remove()
                } catch (err) {
                    $(`#bloco-modal-vtt-${hash}`).remove()
                }
            }

            let width = '99%'

            if (ObjectUtil.getValueProperty(options, 'width'))
                width = options.width

            if (mobileUtil.isMobile() || mobileUtil.isTablet())
                width = '99%'


            this.eventObserver()



            setTimeout(() => {

                let template = _.template($('#template-modal').html())


                $("body").append(template({
                    hash: hash,
                    title: title,
                    html: html,
                    iframe: iframe
                }))



                setTimeout(() => {
                    let key = `#bloco-modal-vtt-${hash}`
                    let dialogClass = `bloco-modal-vtt-${hash}`
                    let send = {
                        element: key,
                        classElement: dialogClass,
                        config: {
                            dialogClass: dialogClass,
                            key: key,
                            draggable: false,
                            closeOnEscape: false,
                            width: width,
                            resizable: false,
                            maxHeight: window.innerHeight - 15,
                            zIndex: 1060,
                            modal: true,
                            open: (e, ui) => {
                                $("#overlay-dialog").show()


                                if (options.isCloseX == false) {

                                    $(key).css('overflow', 'hidden')
                                    $(`.${dialogClass} .ui-dialog-titlebar`).find('button.ui-dialog-titlebar-close').remove()

                                }


                                jquertUtil.initializeComponentesJquery()
                                maskedUtil.init()



                                setTimeout(() => {

                                    let elementModal = $(`.${dialogClass}`)

                                    try {

                                        let top = parseFloat(elementModal.position().top)




                                        let totalElement = elementModal.height() + elementModal.position().top

                                        let windowHeight = $(window).height()

                                        let leftCalc = (totalElement - windowHeight)

                                        let reverse = (windowHeight - totalElement)


                                        if (totalElement > windowHeight) {
                                            if (top > leftCalc)
                                                $(`.${dialogClass}`).css({ 'top': ((top - leftCalc) / 2) })
                                            else
                                                $(`.${dialogClass}`).css({ 'top': ((leftCalc - top) / 2) })

                                        } else if (reverse > 0 && top > reverse)
                                            $(`.${dialogClass}`).css({ 'top': ((top - reverse) / 2) })




                                    } catch (err) {

                                    }

                                }, 1000);
                            },
                            close: (e, ui) => {

                                try {
                                    try {
                                        this._observerResize.unobserve(`.${send.classElement}`)
                                    } catch (err) {

                                    }
                                    $("#overlay-dialog").hide()
                                    $(e.currentTarget).dialog('destroy')
                                } catch (err) {

                                } finally {
                                    $('body').find(`#${$(e.target).prop('id')}`).remove()
                                }
                            }
                        }
                    }





                    if (options != undefined) {
                        $deferred.then(function (r) {
                            $(send.element).css({ 'overflow-x': 'hidden' })
                            //options.isCloseX == false ? $(".ui-dialog-titlebar-close").hide() : $(".ui-dialog-titlebar-close").show()
                        })

                        if (options.buttonClose == true) {
                            _.extend(send.config, {
                                buttons: {
                                    'Fechar': function () {
                                        $(this).dialog("close");

                                    }
                                }
                            })
                        }

                    }

                    $deferred.then(modal => {

                        try {
                            this._observerResize.observe(document.querySelector(`.${modal.classElement}`))
                        } catch (err) {
                            
                        }
                    })

                    return $deferred.resolve(send)
                }, 100)
            }, 100)

        } catch (err) {
            return $deferred.reject(err)
        }

        return $deferred.promise()
    }
}

module.exports = () => {
    return ModalUtil
}
