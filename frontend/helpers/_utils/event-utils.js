const stringUtil = require('./string-util')()

let listeners = []

const methodPrivate = {
    generateEventObject: Symbol('generateEventObject')
}

module.exports = class EventUtil {


    static [methodPrivate.generateEventObject](name, callback) {
        let callListener = stringUtil.uuid().replace('-', '_')
        return {
            name: name,
            nameCallListener: callListener,
            [callListener]: (e) => {
                e.stopImmediatePropagation()
                callback(e.data)
            }
        }
    }



    static on(name, callback) {

        let event = this[methodPrivate.generateEventObject](name, callback)

        if (listeners.length == 0) {
            listeners.push(event)
            document.addEventListener(event.name, event[event.nameCallListener])
        } else {

            let exists = _.find(listeners, { name: name })

            if (exists) {
                listeners = listeners.map(row => {
                    
                    if (row.name == event.name) {

                        document.removeEventListener(row.name, row[row.nameCallListener])

                        row = event

                        document.addEventListener(event.name, event[event.nameCallListener])

                        event = this[methodPrivate.generateEventObject](name, callback)
                    }
                    return row
                })
            } else {
                listeners.push(event)
                document.addEventListener(event.name, event[event.nameCallListener])
            }

        }
    }

    static emit(name, data) {


        if (!_.find(listeners, { name: name }))
            return


        let event = new CustomEvent(name)

        event.data = data

        document.dispatchEvent(event)
    }


}

