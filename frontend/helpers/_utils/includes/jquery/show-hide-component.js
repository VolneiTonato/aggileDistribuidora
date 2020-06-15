module.exports = class ShowHideComponent {

    constructor(element){
        this._element = element
    }

    hideComponent(){
        $(this._element).hide()

        return this
    }

    showElement(){
        $(this._element).show()

        return this
    }

    setOffClick(){
        $(this._element).off('click')

        return this
    }

    setOnClick(){
        $(this._element).on('click')

        return this
    }



    disabledElement(){
        $(this._element).attr('disabled', true)

        return this
    }

    blockAndDisabledElement(){
        this.setOffClick().disabledElement()

        return this
    
    }

}