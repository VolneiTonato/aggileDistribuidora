const path = require('path')
const fs = require('fs')
const serviceWorker = require('../services/serviceWorkerApi/serviceworker')




module.exports = (app, passport) => {
    let _router = require('express').Router()

    app.set('base', '/')

    app.use('/', _router)

    
    app.post('/get-register-token', (req, res, next) => {

        if (req.isAuthenticated() && 'adminAggile' in req.session && ('tokenAccess' in req.session.adminAggile))
            return res.send(req.session.adminAggile.tokenAccess)
        return res.send('')
    })

    app.get('/service-worker-aggile-distribuidora-all', (req, res, next) => {

        res.header('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0')
        res.header('Expires', '-1')
        res.header('Pragma', 'no-cache')



        fs.readFile(path.join(__dirname + '/../public/dist/serviceWorkerSite.bundle.js'), (err, body) => {
            if (err)
                return res.set('Content-Type', 'text/javascript').send('')

            let data = ''
            let type = 'site' //req.query.type || 'site'

            let promise = new Promise((resolve, reject) => {


                if (type == 'site') {
                    data = body.toString().replace(/({cache_version})/gi, 'v1')
                    data = data.toString().replace(/(\{ignore_urls\})/ig, `obter-auth-validation|admin|reports|api|mobile`)
                } else if (type == 'mobile') {
                    data = body.toString().replace(/({cache_version})/gi, '_mobile_v1')
                    data = data.toString().replace(/(\{ignore_urls\})/ig, `admin|reports|api`)
                }



                serviceWorker.cacheSite(type).then((body) => {
                    data = data.toString().replace(/("{cache_files}")/gi, `'${body.toString().replace(/,/ig, "','")}'`)

                    return resolve(data)


                }).catch((err) => {
                    return resolve([])
                })

            })

            promise.then((body) => {
                return res.set('Content-Type', 'text/javascript').send(body)
            })
        })

    })





    require('../src/appAggileDistribuidora/routers/router')(app)
    require('../src/appAggileDistribuidoraMobile/routers/router')(app)
    require('../src/appAggileDistribuidoraAdmin/routers/router')(app, passport)
    require('../src/appWebService/routers/router')(app)
    require('../src/appAggileRelatorios/routers/router')(app)



    app.use((err, req, res, next) => {
        
        res.status(400).send(err.toString())
    })



}