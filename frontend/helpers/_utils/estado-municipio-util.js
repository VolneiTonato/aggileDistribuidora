const objectUtil = require('./object-util')()
const apiUtil = require('./api-utils')()
const jqueryUtil = require('./jquery-util')()
const localStore = require('./local-storage-util')

let _cache = {
    estadoMunicipios: {
        ufPesq: null,
        estado: null,
        municipios: null
    },
    estados: {
        ufPesq: null,
        data: null
    },
    municipios: {
        ufPesq: null,
        data: null
    },
}

const estados = async (ufPesq) => {

    _cache.estados.data = await apiUtil.estados(ufPesq)
}


const municipios = async (estadoId) => {

    return await apiUtil.municipios(estadoId)

}

const estadosMunicipios = async (ufPesq) => {

    if (_cache.estadoMunicipios.ufPesq == ufPesq && _cache.estadoMunicipios.ufPesq !== null)
        return

    let obj = await apiUtil.estadoMunicipios(ufPesq)

    _cache.estadoMunicipios.ufPesq = 'RS'
    _cache.estadoMunicipios.estado = obj.estado
    _cache.estadoMunicipios.municipios = obj.municipios
}


class EstadoMunicipioUtil {

    static municipioSelectBox(param = {}) {
        let options = {
            estadoId: '21',
            municipioElement: '#municipio',
            isSelect2: true,
            municipio: ''
        }

        $.extend(true, options, param)


        let OverlayMunicipio = $(`${options.municipioElement}`).closest('.form-group').find('.overlay')

        let optionsMunicipio = '<option value="">Selecione</option>'


        municipios(options.estadoId).then((municipios) => {

            
            municipios.forEach((item) => {
                optionsMunicipio += `<option value="${item.id}"} 
                                        ${item.id == options.municipio ? "selected" : ""}>
                                        ${item.descricao}</option>`

            })

            $(`${options.municipioElement}`).html(optionsMunicipio)

            OverlayMunicipio.hide()

            if (options.isSelect2)
                jqueryUtil.select2()
        })


    }


    /**
     * 
     * @param {uf, municipio, estadoElement, municipioElement, isSelect2}
     */
    static estadoMunicipioSelectBox(param = {}) {
        let options = {
            uf: 'RS',
            estadoElement: '#estado',
            municipioElement: '#municipio',
            isSelect2: true,
            municipio: '',
            parent : param.parentElement || ''

        }

        if(options.parent.length > 0){
            options.estadoElement = `${options.parent} ${options.estadoElement}`
            options.municipioElement = `${options.parent} ${options.municipioElement}`
        }

        $.extend(true, options, param)

        let OverlayEstado = $(`${options.estadoElement}`).closest('.form-group').find('.overlay')
        let OverlayMunicipio = $(`${options.municipioElement}`).closest('.form-group').find('.overlay')


        OverlayEstado.show()
        OverlayMunicipio.show()

        estadosMunicipios(options.uf).then(() => {

            let optionsEstado = `<option value="${_cache.estadoMunicipios.estado.id}" selected>${_cache.estadoMunicipios.estado.descricao}</option>`
            $(`${options.estadoElement}`).html(optionsEstado)

            OverlayEstado.hide()

            let optionsMunicipio = '<option value="">Selecione</option>'



            _cache.estadoMunicipios.municipios.forEach((item) => {
                optionsMunicipio += `<option value="${item.id}"} 
                                    ${item.id == options.municipio ? "selected" : ""}>
                                    ${item.descricao}</option>`

            })

            $(`${options.municipioElement}`).html(optionsMunicipio)

            OverlayMunicipio.hide()

            if (options.isSelect2)
                jqueryUtil.select2()


        })
    }

}


module.exports = () => {

    return EstadoMunicipioUtil
} 