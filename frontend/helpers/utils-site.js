module.exports = {
    JqueryUtil : require('./_utils/jquery-util')(),
    //MobileUtil : require('./_utils/mobile-util')(),
    ObjectUtil : require('./_utils/object-util')(),
    HtmlUtil: require('./_utils/html-util')(),
    UnderscoreUtil: require('./_utils/underscore-utils')(),
    UrlUtil : require('./_utils/url-util')(),
    localStorageUtil : require('./_utils/local-storage-util'),
    ServiceWorkerUtil : require('./_utils/service-worker-utils').ServiceWorkerAll,
    SessionStorageUtil: require('./_utils/session-storage-util'),
    StringUtil: require('./_utils/string-util')()


}