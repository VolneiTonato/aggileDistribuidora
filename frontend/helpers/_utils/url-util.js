class UrlUtil {

    constructor() {

    }

    static loadUrlBackbone(url) {
        
        if(window.location.hash.replace('#', '') == url)
            return this.refresh()
        
        window.location.hash = ""
        window._router.navigate(url, { replace: true, trigger: true })
    }

    static setUrlHash(url){
        if(/^#/ig.test(url))
            window.location.hash = url    
        else
            window.location.hash = `#${url}`
    }

    static refresh(){
        location.reload()
    }


    static forceHTTPS() {


        //if (location.protocol == 'http:' &&  ['localhost','3.17.230.36', 'www.destiladosdaserra.com.br'].indexOf(location.hostname) === -1)
        //    location.href = location.href.replace(/^http:/, 'https:')        
    }


    static url(value) {
        return `/${value || ''}`
    }
}

module.exports = () => {
    return UrlUtil
}