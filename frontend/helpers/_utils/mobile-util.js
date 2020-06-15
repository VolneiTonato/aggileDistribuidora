
const mb = () => {
    return new MobileDetect(window.navigator.userAgent)
}


class MobileUtil {
    
    //https://www.npmjs.com/package/mobile-detect
    static isMobile(){
        let _isMobile = new MobileDetect(window.navigator.userAgent).mobile()
        return _isMobile !== null
    }

    static IsMobileOrTablet(){
        return this.isMobile() || this.isTablet()
    }

    static isTablet(){
        //return mb().tablet() !== null
        let _isMobile = new MobileDetect(window.navigator.userAgent).tablet()
        return _isMobile !== null
    }
}


module.exports = () => {
    return MobileUtil
}