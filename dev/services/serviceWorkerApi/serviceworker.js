const fs = require('fs')
const path = require('path')
const _ = require('lodash')
const util = require('../../helpers/_utils/utils')
const sessionInclude = require('../../models/aggile-session/aggileSessionIncludeModel')
let dataSession = []

const padrao = [
    '/public/imagens/aggile-distribuidora/favicon.ico',
    '/public/manifest.json',
    '/public/imagens/loader.svg',
    '/public/imagens/loading.gif',
    '/public/imagens/aggile-distribuidora/logo.png'
]

const padraoAdmin = [
    'public/libraries/bower/bootstrapv3.3.7/dist/css/bootstrap.min.css',
    'public/libraries/bower/font-awesome/css/font-awesome.min.css',
    'public/libraries/bower/ionicons/css/ionicons.min.css',
    'public/libraries/bower/admin-lte/dist/css/AdminLTE.min.css',
    'public/libraries/bower/admin-lte/dist/css/skins/_all-skins.min.css',
    'public/styles/admin-lte/template.css',
    'public/libraries/bower/jquery/dist/jquery.min.js',
    'public/libraries/bower/jquery-migrate/jquery-migrate.min.js',
    'public/libraries/bower/bootstrapv3.3.7/dist/js/bootstrap.min.js',
    'public/libraries/bower/jquery-ui/jquery-ui.min.js',
    'public/libraries/bower/fastclick/lib/fastclick.js',
    'public/libraries/bower/select2/dist/css/select2.min.css',
    'public/libraries/bower/select2-bootstrap-theme/dist/select2-bootstrap.min.css',
    'public/libraries/bower/jquery-ui/themes/smoothness/jquery-ui.min.css',
    'public/libraries/bower/jstree/dist/themes/default/style.min.css',
    'public/libraries/bower/chart.js/Chart.js',
    'public/libraries/bower/select2/dist/js/select2.full.min.js',
    'public/libraries/bower/jquery.inputmask/dist/min/inputmask/inputmask.min.js',
    'public/libraries/bower/jquery.inputmask/dist/min/inputmask/jquery.inputmask.min.js',
    'public/libraries/bower/jquery.inputmask/dist/min/inputmask/inputmask.numeric.extensions.min.js',
    'public/libraries/bower/jquery-price-format/jquery.priceformat.min.js',
    'public/libraries/bower/moment/min/moment.min.js',
    'public/libraries/bower/jstree/dist/jstree.min.js',
    'public/libraries/bower/admin-lte/dist/js/adminlte.min.js',
    'public/libraries/bower/admin-lte/dist/js/demo.js',
    'public/libraries/bower/underscore/underscore-min.js',
    'public/libraries/bower/backbone/backbone-min.js',
    'public/imagens/aggile-distribuidora/favicon.ico'
]
/*
const site = [
    '/',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.0.0/css/bootstrap.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/mdbootstrap/4.5.0/css/mdb.min.css',
    '/public/styles/aggile-distribuidora/template.css',
    'https://cdnjs.cloudflare.com/ajax/libs/ekko-lightbox/5.3.0/ekko-lightbox.css',
    'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.13.0/umd/popper.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.0.0/js/bootstrap.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/mdbootstrap/4.5.0/js/mdb.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jquery.lazy/1.7.7/jquery.lazy.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jquery.lazy/1.7.7/jquery.lazy.plugins.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.21.0/moment.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.21.0/locale/pt-br.js',
    'https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.8.3/underscore-min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/backbone.js/1.3.3/backbone-min.js',
    "https://cdnjs.cloudflare.com/ajax/libs/ekko-lightbox/5.3.0/ekko-lightbox.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/fancybox/3.3.5/jquery.fancybox.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/fancybox/3.3.5/jquery.fancybox.min.css",
    'https://cdnjs.cloudflare.com/ajax/libs/mobile-detect/1.4.1/mobile-detect.min.js',
    '/public/dist/vendorSite.bundle.js',
    '/public/dist/aggileDistribuidora.bundle.js',
    '/public/imagens/aggile-distribuidora/data-images-bebidas-quentes.json',
    '/public/imagens/aggile-distribuidora/data-images-bebidas-quentes-apresentacao.json',
    '/public/imagens/aggile-distribuidora/data-images-vinhos.json',
    '/public/imagens/aggile-distribuidora/data-images-vinhos-apresentacao.json'
].push(padrao)*/



const mobile = _.uniq(_.union([
    '/mobile'
], padraoAdmin))

const site = _.uniq(_.union([
    '/',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.12.1/css/all.min.css',
    'https://cdn.linearicons.com/free/1.0.0/icon-font.min.css',
    '/public/styles/aggile-distribuidora/template.css',
    'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.1/jquery.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.15/lodash.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/backbone.js/1.3.3/backbone-min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/notify/0.4.2/notify.min.js',
    '/public/dist/aggileDistribuidora.bundle.js',
    '/public/imagens/aggile-distribuidora/bg-01.jpg'
], padrao))

const admin = [
    'admin',
    'public/dist/vendorAdmin.bundle.js',
    'public/dist/aggileDistribuidoraAdmin.bundle.js'
]


/**
 * Find all files inside a dir, recursively.
 * @function getAllFiles
 * @param  {string} dir Dir path string..
 */
/*
const getAllFiles = dir =>

    fs.readdirSync(dir).reduce((files, file) => {
        const name = path.join(dir, file)
        const isDirectory = fs.statSync(name).isDirectory();
        return isDirectory ? [...files, ...getAllFiles(name)] : [...files, name];
    }, [])*/



/*
const imagens = () => {


    return new Promise((resolve, reject) => {
        let data = []

        if (dataSession.length > 0)
            return resolve(dataSession)



        let sessionFiles = new sessionInclude.SessionFilesModel()

        let body = undefined

        //data: { '$gte': utils.DateUtil.subDay(2, "00:00:01").getTime() }


        
        sessionFiles.obter({ type: 'imagens-bebidas', hash: process.env.hashSecurity }).then((body) => {

            if (body == undefined) {

                data = getAllFiles(__dirname + '/../../public/imagens/aggile-distribuidora/bebidas')


                let result = []

                data.filter((item) => {

                    let link = /(?:.+)(\/public\/imagens\/.+)/ig.exec(item)

                    if ('1' in link)
                        item = link[1]

                    result.push(item)
                })


                sessionFiles.remove({ type: 'imagens-bebidas' }).then(() => {
                    sessionFiles.save({ type: 'imagens-bebidas', data: result, hash: process.env.hashSecurity }).then((ok) => {
                        return resolve(result)
                    }).catch((err) => {
                        return resolve(result)
                    })
                })

            } else {
                dataSession = body.data
                return resolve(body.data)
            }

        }).catch((err) => {
            return resolve([])
        })

    })
}*/

class CacheServiceWorker {


    static async cacheSite(type) {

        //let images = await imagens()

        return await site

        if (type == 'admin')
            return await admin
        else if(type == 'mobile')
            return await mobile
        else
            return await site
    }

    static listAdmin() {
        //return admin
    }


}


module.exports = CacheServiceWorker
