/*
let cacheName = 'service_worker_aggiledistribuidora_admin{cache_version}'


let filesCache = [
    '/',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.0.0/css/bootstrap.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/mdbootstrap/4.5.0/css/mdb.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/ekko-lightbox/5.3.0/ekko-lightbox.css',
    '/public/styles/aggile-distribuidora/template.css',
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
    "https://cdnjs.cloudflare.com/ajax/libs/fancybox/3.3.5/jquery.fancybox.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/fancybox/3.3.5/jquery.fancybox.min.css",
    '/public/dist/vendorSite.bundle.js',
    '/public/manifest.json',
    '/public/imagens/loader.svg',
    '/public/imagens/loading.gif',
    '/public/dist/aggileDistribuidora.bundle.js',
    '/public/imagens/aggile-distribuidora/data-images-bebidas-quentes.json',
    '/public/imagens/aggile-distribuidora/data-images-vinhos.json',
    '/public/imagens/aggile-distribuidora/logo.png',
    '/admin',
    '/admin/clientes/list',
    '/public/libraries/bower/bootstrapv3.3.7/dist/css/bootstrap.min.css',
    '/public/libraries/bower/font-awesome/css/font-awesome.min.css',
    '/public/libraries/bower/ionicons/css/ionicons.min.css',
    '/public/libraries/bower/admin-lte/dist/css/AdminLTE.min.css',
    '/public/libraries/bower/admin-lte/dist/css/skins/_all-skins.min.css',
    '/public/styles/admin-lte/template.css',
    '/public/libraries/bower/jquery/dist/jquery.min.js',
    '/public/libraries/bower/jquery-migrate/jquery-migrate.min.js',
    '/public/libraries/bower/bootstrapv3.3.7/dist/js/bootstrap.min.js',
    '/public/libraries/bower/jquery-ui/jquery-ui.min.js',
    '/public/libraries/bower/fastclick/lib/fastclick.js',
    '/public/libraries/bower/select2/dist/css/select2.min.css',
    '/public/libraries/bower/select2-bootstrap-theme/dist/select2-bootstrap.min.css',
    '/public/libraries/bower/jquery-ui/themes/smoothness/jquery-ui.min.css',
    '/public/libraries/bower/jstree/dist/themes/default/style.min.css',
    '/public/libraries/bower/chart.js/Chart.min.js',
    '/public/libraries/bower/mobile-detect/mobile-detect.min.js',
    '/public/libraries/bower/select2/dist/js/select2.full.min.js',
    '/public/libraries/bower/jquery.inputmask/dist/min/inputmask/inputmask.min.js',
    '/public/libraries/bower/jquery.inputmask/dist/min/inputmask/jquery.inputmask.min.js',
    '/public/libraries/bower/jquery.inputmask/dist/min/inputmask/inputmask.numeric.extensions.min.js',
    '/public/libraries/bower/jquery-price-format/jquery.priceformat.min.js',
    '/public/libraries/bower/moment/min/moment.min.js',
    '/public/libraries/bower/jstree/dist/jstree.min.js',
    '/public/libraries/bower/admin-lte/dist/js/adminlte.min.js',
    '/public/libraries/bower/admin-lte/dist/js/demo.js',
    '/public/libraries/bower/underscore/underscore-min.js',
    '/public/libraries/bower/backbone/backbone-min.js',
    '/public/dist/vendorAdmin.bundle.js',
    '/public/imagens/aggile-distribuidora/favicon.ico',
    '/public/dist/aggileDistribuidoraAdmin.bundle.js'
]


self.addEventListener('install', function (e) {

 
    e.waitUntil(
        caches.open(cacheName).then(function (cache) {


            return cache.addAll(filesCache)

        }).then(function () {

            self.skipWaiting()

        }).catch(function (err) {

        })
    )
})

self.addEventListener('activate', function (e) {

    e.waitUntil(
        caches.keys().then(function (keyList) {

     

            return Promise.all(keyList.map(function (key) {

                if (key !== cacheName)
                    return caches.delete(key)
            }))
        }).catch(function (err) {

        })
    )
})

self.addEventListener('fetch', function (e) {


    e.respondWith(



        caches.match(e.request).then(function (response) {
            return response || fetch(e.request)
        }).catch(function (err) {

        })
    )

})*/