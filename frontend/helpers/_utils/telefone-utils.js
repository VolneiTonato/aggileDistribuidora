const underscoreUtil = require('./underscore-utils')()
const messageUtil = require('./message-util')()
const stringUtil = require('./string-util')()
const numberUtil = require('./number-util')()


const addBlockHtml = async (data = {}) => {
    await underscoreUtil._template('#template-telefone-body', { telefone: data }, '#inner-template-telefone-body', { append: true })
}

class TelefoneUtil {

    constructor(element, innerElementTelefone, max = 4) {

        underscoreUtil._template('#template-telefone-header', {}, innerElementTelefone)

        this._element = element
        this._max = max
        this.events()
    }

    events() {
        $('body').find(this._element).off('click', '.btn-add-telefone')
        $('body').find(this._element).on('click', '.btn-add-telefone', (e) => {
            e.preventDefault()
            this.add()
        })

        $('body').find(this._element).off('click', '.btn-remove-telefone')
        $('body').find(this._element).on('click', '.btn-remove-telefone', (e) => {
            e.preventDefault()
            if (this.count() === 1)
                return false

            let element = $(e.currentTarget).closest('.block-telefone-adicional')

            let numero = numberUtil.telefoneFormat(element.find('input[name="telefones[]"]').val())

            let run = () => {
                $(element).remove()
            }

            if (numero.length > 0) {
                let options = {
                    buttons: {
                        'Sim': (e) => {
                            run()
                            messageUtil.closeButton(e)
                        },
                        'Não': (e) => {
                            messageUtil.closeButton(e)
                        }
                    }
                }


                messageUtil.message(`Deseja remover este número de telefone ${numero}?`, 'warning', options)
            }else{
                run()
            }
        })
    }

    count() {
        return $('body').find(this._element).find('.block-telefone-adicional').length
    }

    async add(data = {}) {
        if (this.count() == this._max)
            return await messageUtil.alert(`O máximo permitido para telefones é de ${this._max}`, 'danger')

        await addBlockHtml(data)
    }


    async addListaTelefones(telefones = []) {
        await Promise.all(telefones.map(async fone => {
            await addBlockHtml(fone)
        }))
    }
}

module.exports = TelefoneUtil
