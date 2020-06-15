let utils = require('../../../../../../helpers/utils-admin')

class SincronizacaoModel extends utils.BackboneModelUtil{

    async sincronizacao(url){
        this.url = `/admin/sincronizacao/${url}`
        return await this.fetch()
    }
}

module.exports = class SincronizacaoMaster extends Backbone.View {

    constructor(options = {}) {
        super()

        this.$el = $(options.block)

        this._block = options.block
        this._button = options.button
        this._operacao = options.operacao

        this._model = new SincronizacaoModel()
        

        this.overrideEvents()

        this.render(grupo)
    }

  
    reset() {
        this.$el.off('click', `${this._block} ${this._button}`)
    }


    overrideEvents() {


        this.reset()

        let strJson = $.trim(`{
            "click ${this._block} ${this._button}" : "exec"
        }`)

        let data = JSON.parse(strJson)

        this.delegateEvents(data)

    }

    exec(e) {
        e.preventDefault()


        this._model.sincronizacao(this._operacao).then((ok) => {
            utils.MessageUtil.alert('Operação realizada com sucesso!', 'success')
        }).catch((err) => {
            utils.MessageUtil.error(err)
        })
    }

    render(){
        
    }
}