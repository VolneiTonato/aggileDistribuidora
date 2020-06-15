const _cache = {
    isRefreshPaginator : false,
    offsetRefresh : 0,
    offsetCurrent : 10
}

class PaginatorUtil {

    constructor() {

    }

    static calcularPaginator(obj = {}, offset = 10){

        if(!obj.paginator)
            return obj

        if(obj.paginator.limit > 10 && _cache.isRefreshPaginator == true){
            obj.paginator.limit = 10
            obj.paginator.offset = _cache.offsetCurrent
            _cache.isRefreshPaginator = false
        }


        obj.paginator.limit = obj.paginator.limit || 10
        obj.paginator.offset += offset || 10

        return obj
    }

    static paginatorRefreshPage(obj = {}){
        if(!obj.paginator)
            return obj

        _cache.isRefreshPaginator = true

        _cache.offsetCurrent = obj.paginator.offset
        _cache.offsetRefresh = 0

        obj.paginator.limit = obj.paginator.offset
        obj.paginator.offset = 0

        return obj
    }

    static paginator() {
        return {
            paginator : {
                limit : 10,
                offset : 0
            }
        }
    }
}

module.exports = () => {
    return PaginatorUtil
}