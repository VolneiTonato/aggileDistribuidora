
class OrderTableUtils{
    constructor(parent){

        this._parent = parent

        process.nextTick(() => {
            this.JsonUtil = require('../json-util')(),
            this.events()
        })

        
    }

    events(){
        $('body').find(this._parent).off('click', '.order-by-column')
        $('body').find(this._parent).on('click', '.order-by-column', e => {
            e.preventDefault()

            this.orderBy(e)
        })
    }

    orderBy(e) {

        let table = $(e.currentTarget).closest('table')

        let backupTable = _.clone(table.find('.table-sorter-row tr'))

        let dir = $(e.currentTarget).attr('data-order') || 'asc'

        if(dir == 'asc'){
            $(e.currentTarget).attr('data-order', 'desc')
            $(e.currentTarget).find('span').removeClass('fa-angle-down').addClass('fa-angle-up')
        }else{
            $(e.currentTarget).attr('data-order', 'asc')
            $(e.currentTarget).find('span').removeClass('fa-angle-up').addClass('fa-angle-down')
        }


        let list = []

        table.find('.row-item-list').each((i, row) => {
            let obj = this.JsonUtil.toParse($(row).attr('data-item'))
            obj.idx = i
            list.push(obj)
        })

        let columnName = $(e.currentTarget).attr('data-value')

        
        let sorter = _.sortBy(list, columnName)

        if(dir == 'desc')
            sorter = sorter.reverse()


        table.find('.row-item-list').remove()

        let append = table.find('.table-sorter-row')
        

        sorter.forEach(item => {
            $(append).append($(backupTable).eq(item.idx))
        })
    
    }



}


class SearchTableUtils{
    constructor(parent){


        this._parent = parent

        this.events()

    }


    events(){
        $('body').find(this._parent).off('keyup', '.search-fast')
        $('body').find(this._parent).on('keyup', '.search-fast', e => {
            e.preventDefault()
            this.searchTable(e)
        })
    }


    searchTable(e){
        e.preventDefault()

        let value = $(e.currentTarget).val()

        let table = $(e.currentTarget).closest('.data-table')

        table.find('.table-sorter-row tr').each((i, row) => {
            let found = false
            $(row).each((i, td) => {
                if($(td).text().toLowerCase().indexOf(value.toLowerCase()) >= 0){
                    found = true
                }
            })

            if(found == true)
                $(row).show()
            else
                $(row).hide()
        })


    }
}




module.exports = class TableUtils{

    constructor(parent = ''){

        new OrderTableUtils(parent)

        new SearchTableUtils(parent)
    }

    


    

    




    


}