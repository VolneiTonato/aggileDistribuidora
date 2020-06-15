const querySort = (req, res, next) => {
    let order = []
    if (req.query.sort) {

        let query = req.query.sort

        if (/,/ig.test(query)) {

            (query.split(',')).forEach((item) => {
                if (/^-/ig.test(item))
                    order.push([item.replace('-', ''), 'DESC'])
                else
                    order.push([item, 'ASC'])
            })

        } else {
            if (/^-/ig.test(query))
                order.push([query, 'DESC'])
            else
                order.push([query, 'ASC'])
        }
        req.orderby = order
    }

    next()
}

const queryPaginator = (req, res, next) => {

    return next()
    try {
        let paginator = req.body.paginator || req.query.paginator

        if (!paginator)
            req.paginator = {}

        req.paginator = paginator

        delete req.body.paginator
        delete req.query.paginator

    } catch (err) {

    } finally {
        next()
    }
}



module.exports = [querySort, queryPaginator]

