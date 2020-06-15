let cacheName = 'service_worker_aggiledistribuidora{cache_version}'

let filesCache = ['{cache_files}']



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


                if (key !== cacheName) {
                    return caches.delete(key)
                }
            }))
        }).catch(function (err) {

        })
    )

})



self.addEventListener('fetch', function (e) {

    let url = e.request.url

    if(/\/({ignore_urls})/ig.test(url))
        return false
        
    if(/(\.woff2)/ig.test(url))
        return false
    
    if(/(bower|admin-lte)/ig.test(url))
        return false

    e.respondWith(
        caches.match(e.request, { ingnoreSearch: true }).then(function (response) {

            //return response || fetch(e.request)


            //add automatic intes

            if(response)
                return response

            var fetchRequest = e.request.clone()

            return fetch(fetchRequest).then(
                function(response) {
                  // Check if we received a valid response
                  if(!response || response.status !== 200 || response.type !== 'basic') {
                    return response;
                  }
      
                  // IMPORTANT: Clone the response. A response is a stream
                  // and because we want the browser to consume the response
                  // as well as the cache consuming the response, we need
                  // to clone it so we have two streams.
                  var responseToCache = response.clone();
      
                  caches.open(cacheName)
                    .then(function(cache) {
                      cache.put(e.request, responseToCache);
                    });
      
                  return response;
                }
              );            
            
        }).catch(function (err) {

        })
    )
    


})