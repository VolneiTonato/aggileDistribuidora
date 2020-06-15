const messageUtil = require('./message-util')()

const errorGeolocatizacao = (error) => {
    let message = ''
    switch (error.code) {
        case error.PERMISSION_DENIED:
            message = "User denied the request for Geolocation."
            break
        case error.POSITION_UNAVAILABLE:
            message = "Location information is unavailable."
            break
        case error.TIMEOUT:
            message = "The request to get user location timed out."
            break
        case error.UNKNOWN_ERROR:
            message = "An unknown error occurred."
            break
    }

    return message
}


const locationGeoLocatizacao = async () => {

    return new Promise((resolve, reject) => {
        try {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((position) => {
                    return resolve(position.coords)
                }, (err) => {
                    return reject(errorGeolocatizacao(err))                        
                })
            } else {
                throw 'Geolocalização não suportada!'
            }
    
        } catch (err) {
            return reject(err)
        }
    })


    
}

class LocationUtil {

    constructor(element, input) {
        this._element = element

        this._input = input || 'endereco_latitudeLongitude'

        this.events()
    }

    events() {

        

        $(this._element).off('click', '.btn-add-geolocalizacao')
        $(this._element).on('click', '.btn-add-geolocalizacao', async (e) => {
            e.preventDefault()
   
            let pos = await locationGeoLocatizacao().catch((err) => {
                messageUtil.alert(err, 'danger')
            })
            
            if(pos)
                $(this._element).find(`input[name="${this._input}"]`).val(`${pos.latitude},${pos.longitude}`)
        })
    }

    
}

module.exports = LocationUtil