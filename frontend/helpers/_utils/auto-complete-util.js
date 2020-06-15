const modalUtil = require('./modal-util')()
const indexDbUtil = require('./indexed-db-utils')()
const objectUtil = require('./object-util')()

class AutoCompleteUtil {


    /**
     * 
     * @param {*} param {bloco, input, parent, callback}
     */
	constructor(param = {}) {
		this._bloco = param.bloco
		this.$el = $(`${this._bloco}`)
		this._parent = param.parent == undefined ? this.$el.closest('.form-group') : this.$el.closest(param.parent)
		this._input = param.input
		this._blockMessage = param._blockMessage == undefined ? this.$el.closest('.parent-autocomplete-pessoa') : this.$el.closest(param.parent)
		this._callback = param.callback
		this._isClearValue = param.isClearValue
		this._fabricaId = param.fabricaId
		this._form = param.form != undefined ? $(param.form) : undefined
		this._type = param.type
		this._url = param.url
		this._labels = param.labels
		this._primaryKey = param.primaryKey || 'id'
		this._queryString = param.queryString
		this._minText = param.minText || 2

		if (param.optionsIndexDb) {

			this._rows = param.optionsIndexDb.rows
			this._labels = param.optionsIndexDb.labels
			this._database = param.optionsIndexDb.database
			this._template = param.optionsIndexDb.template
			this._primaryKey = param.optionsIndexDb.primaryKey
			this._isTemplate = param.optionsIndexDb.isTemplate == false ? false : true
		}

		this.keyUp()


		if (param.type == 'indexdb')
			this.autocompleteIndexDb()
		else
			this.autocompleteServer()




	}


	keyUp() {

		$('body').on('keyup', `#${this.$el.prop('id')}`, (e) => {

			if (e.keyCode == 13) {

			} else if ($(e.currentTarget).val() == 0) {

				if (this._parent.find(this._input).length > 0)
					this._parent.find(this._input).val('')

				if (this._form && (this._form.find(this._input).length > 0))
					this._form.find(this._input).val('')

				this.mensagemHelpInput('', '', false)
			}
		})
	}

	mensagemHelpInput(message, type, show) {
		let template = _.template(`<span style="display:<%= show %>" class="span-message-autocomplete text-<%= type %>"><strong><%= message %></strong></span>`)
		this._blockMessage.find('.span-message-autocomplete').remove()
		this._blockMessage.append(template({ message: message, type: type, show: (show == true) ? 'block' : 'none' }))
	}



	async autocompleteIndexDb() {


		let rows = this._rows


		this.$el.autocomplete({
			source: async (request, response) => {

				let itens = await indexDbUtil.findAll(this._database)

				let templateAutocomplete = ''

		
				if(this._isTemplate)
					templateAutocomplete = _.template($(this._template).html())
				else
					templateAutocomplete = _.template(this._template)

				let data = itens.filter(item => {

					let isExists = false

					rows.forEach(row => {

						if (item[row].toString().toLowerCase().indexOf(request.term.toLowerCase()) !== -1) {
							isExists = true
							return false
						}
					})

					if (isExists)
						return item
				})

				let result = new Array()

				if (data.length == 0)
					this.mensagemHelpInput('Nenhum data encontrado', 'success', true)

				else
					data.forEach(item => {
						result.push({
							label: item[this._labels],
							data: item,
							template: templateAutocomplete(item)
						})
					})

				response(result)
			},
			minLength: 2,
			select: (event, ui) => {
				try {

					this.mensagemHelpInput('', '', false)

					if (this._parent.find(this._input).length > 0)
						this._parent.find(this._input).val(ui.item.data[this._primaryKey])

					if (this._form && (this._form.find(this._input).length > 0))
						this._form.find(this._input).val(ui.item.data[this._primaryKey])


					if (this._isClearValue == true)
						ui.item.value = ''


					if (this._callback != undefined)
						this._callback(ui.item)


				} catch (err) {
					this.mensagemHelpInput(err.toString(), 'danger', true)
				}
			}

		}).autocomplete('instance')._renderItem = (ul, item) => {
			return $('<li>')
				.append(item.template)
				.appendTo(ul)
		}
	}


	autocompleteServer() {
		let url = this._url || ''
		let labels = []
		let template = ''

		let isTesteAutocomplete = false
		let testeAutocomplete = null

		if (url == '') {

			


			if (this._type == 'vendedor') {

				url = 'pessoas/auto-complete-vendedor'
				labels.push('id', 'vendedor.nomeCompleto')
				template = '#template-autocomplete-vendedor'


			} else if (this._type == 'cliente') {

				url = 'pessoas/auto-complete-cliente'
				labels.push('id', 'cliente.razaoSocial', 'cliente.nomeFantasia')
				template = '#template-autocomplete-cliente'

			} else if (this._type == 'fabrica') {

				url = 'pessoas/auto-complete-fabrica/'
				labels.push('id', 'fabrica.razaoSocial', 'fabrica.nomeFantasia')
				template = '#template-autocomplete-fabrica'



			} else if (this._type == 'agencia') {

				url = 'pessoas/auto-complete-agencia'
				labels.push('id', 'agencia.nome')
				template = '#template-autocomplete-agencia'

			} else if (this._type == 'produto') {

				url = 'complementos-produto/auto-complete'
				labels.push('id', 'descricao')
				template = '#template-autocomplete-produto'
				isTesteAutocomplete = true

				testeAutocomplete = (data) => {
					
					if(this._fabricaId)
						return (this._fabricaId === undefined || objectUtil.getValueProperty(data, 'pessoa.id') == this._fabricaId) && data.status == true
					return data.status == true
				}

			} else if (this._type == 'cedente') {

				url = 'pessoas/auto-complete-cedente'
				labels.push('id', 'cedente.razaoSocial', 'cedente.nomeFantasia')
				template = '#template-autocomplete-cedente'

			} else if(this._type == 'conta-bancaria'){
				url = 'pessoas/auto-complete-conta-bancaria'
				labels.push('pessoaAgencia.agencia.numero', 'pessoaAgencia.agencia.banco.codigo','titular')
				template = '#template-autocomplete-conta-bancaria'
			}else{

				url = 'pessoas/auto-complete-cheque'
				labels.push('id', 'numero', 'valor', 'contaBancaria.titular')
				template = '#template-autocomplete-cheque'
			}



		}

		if (this._labels)
			labels = this._labels
		if (this._template)
			template = this._template


		



		this.$el.autocomplete({

			source: (request, response) => {

				let query = {pesquisa : request.term}

				if(this._queryString)
					_.assign(query, this._queryString)

				let xhr = $.ajax({
					url: `/api/${url}`,
					dataType: 'json',
					type: 'POST',
					cache: false,
					beforeSend: () => {
						this._parent.find(this._input).val('')
					},
					data: query
				})

				xhr.done((data) => {					

					if (data.length == 0)
						this.mensagemHelpInput('Nenhum dado encontrado', 'success', true)
					else
						this.mensagemHelpInput('', '', false)

					let result = new Array()


					let templateAutocomplete = _.template($(`${template}`).html())


					_.each(data, (row) => {

						let continueEach = true

						if (isTesteAutocomplete)
							continueEach = testeAutocomplete(row) == true

						if(continueEach)
							result.push({
								label: _.filter(_.map(labels, text => {
									if (objectUtil.getValueProperty(row, text))
										return objectUtil.getValueProperty(row, text)
								})).join(' - '),
								data: row,
								template: templateAutocomplete(row)
							})

					})

					if (result.length == 0)
						this.mensagemHelpInput('Nenhum dado encontrado', 'success', true)

					response(result)

				});

				xhr.fail((e) => {
					this.mensagemHelpInput('Houve um erro ao pesquisar dados no servidor!', 'danger', true)
				})
			},
			minLength: this._minText,
			select: (event, ui) => {
				try {

					this.mensagemHelpInput('', '', false)

					if (this._parent.find(this._input).length > 0)
						this._parent.find(this._input).val(objectUtil.getValueProperty(ui.item.data, this._primaryKey))

					if (this._form && (this._form.find(this._input).length > 0))
						this._form.find(this._input).val(objectUtil.getValueProperty(ui.item.data, this._primaryKey))


					if (this._isClearValue == true)
						ui.item.value = ''


					


					if (this._callback != undefined)
						this._callback(ui.item)


				} catch (err) {
					this.mensagemHelpInput(err.toString(), 'danger', true)
				}
			}

		}).autocomplete('instance')._renderItem = (ul, item) => {
			return $('<li>')
				.append(item.template)
				.appendTo(ul)
		}
	}
}



module.exports = {

	AutoCompleteIndexDb: (param) => {
		$.extend(true, param, { type: 'indexdb' })
		return new AutoCompleteUtil(param)
	},

	AutoComplete: (param) => {
		if (!param.type)
			throw `Param type not found in autocomplete!`

		return new AutoCompleteUtil(param)
	}
}