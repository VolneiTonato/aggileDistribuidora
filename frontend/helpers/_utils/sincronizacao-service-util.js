const runAsyncServer = () => {
    let IndexedDbUtil = require('./indexed-db-utils')()
    let MessageUtil = require('./message-util')()



    let run = (param = {}) => {

        MessageUtil.message('Sincronizando banco de dados com indexedDb. Aguarde...', 'info', { ssid: 'mensagem-manual', button: false })

        IndexedDbUtil.asyncServerToApp(param)
            .then(() => {
                MessageUtil.message('Sincronização completa', 'success', { ssid: 'mensagem-manual' })

            }).catch((err) => {
                MessageUtil.closeButton(undefined, 'mensagem-manual')
                MessageUtil.error(err)
            })
    }

    let runLocalToServer = () => {

        MessageUtil.message('Sincronizando banco de dados com indexedDb. Aguarde...', 'info', { ssid: 'mensagem-manual', button: false })

        IndexedDbUtil.asyncServerToApp()
            .then(() => {
                MessageUtil.message('Sincronização completa', 'success', { ssid: 'mensagem-manual' })

            }).catch((err) => {
                MessageUtil.closeButton(undefined, 'mensagem-manual')
                MessageUtil.error(err)
            })
    }





    let options = {
        buttons: {
            'Todas as Tabelas': (e) => {
                run({newVersion : true})
                MessageUtil.closeButton(e)
            },
            'Enviar dados para o servidor' : (e) => {
                runLocalToServer()
            },
            'Cancelar e Fechar': (e) => {
                MessageUtil.closeButton(e)
            }
        }
    }

    MessageUtil.message('Bem vindo ao assistente de sincronização de dados. Deseja atualizar?', 'warning', options)


}



class SincronizacaoServiceUtil {

    static asyncServerToApp() {
        runAsyncServer()
    }

}

module.exports = () => {
    return SincronizacaoServiceUtil
}