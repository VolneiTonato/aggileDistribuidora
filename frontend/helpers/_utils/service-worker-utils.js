const MessageUtil = require('./message-util')()


module.exports.ServiceWorkerAll = (type) => {
    
    if ('serviceWorker' in navigator && 'onLine' in navigator) {


        if (navigator.onLine) {

            navigator.serviceWorker

                
                .register(`/service-worker-aggile-distribuidora-all${type !== undefined ? `?type=${type}` : ''}`).then((reg) => {
                    console.log('register')

                }).catch((err) => {
                    console.log(err)
                })

          
        }

    } else {
        MessageUtil.error('Sem internet no momento!')
    }
}