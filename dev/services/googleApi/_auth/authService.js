let fs = require('fs')
let readline = require('readline')
const {OAuth2Client} = require('google-auth-library')
let utils = require('../../../helpers/_utils/utils')


// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/sheets.googleapis.com-nodejs-quickstart.json
const SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets.readonly', 
    'https://www.googleapis.com/auth/drive.readonly'
]



const TOKEN_DIR = `${process.env.DIR_ROOT}/config/credenciais/`
const TOKEN_PATH = TOKEN_DIR + 'token.json'


let _auth = null


const credentialServiceInit = () => {

    return new Promise((resolve, reject) => {

        

        fs.readFile(`${process.env.DIR_ROOT}/config/credenciais/cliente_secret.json`, (err, content) => {
            
            if (err)
                return reject(`Error loading client secret file: ${err}`)

            

            // Authorize a client with the loaded credentials, then call the
            // Google Sheets API.
            authorize(JSON.parse(content)).then((auth) => {
                return resolve(auth)
            }).catch((err) => {
                return reject(err)
            })
        })

    })
}


/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
const authorize = (credentials) => {

    return new Promise((resolve, reject) => {

        
        
        
        let clientSecret = credentials.installed.client_secret
        let clientId = credentials.installed.client_id
        let redirectUrl = credentials.installed.redirect_uris[0]
       
       
        let oauth2Client = new OAuth2Client(clientId, clientSecret, redirectUrl)
        

        // Check if we have previously stored a token.
        fs.readFile(TOKEN_PATH, (err, token) => {
            
            if (err) {

                getNewToken(oauth2Client).then((autorizacaoPlanilha) => {
                    return resolve(autorizacaoPlanilha)
                }).catch((err) => {
                    return reject(err)
                })

            } else {

                oauth2Client.credentials = JSON.parse(token)

                return resolve(oauth2Client)
            }
        })
    })
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 *     client.
 */
const getNewToken = (oauth2Client) => {


    return new Promise((resolve, reject) => {

        let authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES
        })

        console.log('Authorize this app by visiting this url: ', authUrl)

        let rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        })




        rl.question('Enter the code from that page here: ', (code) => {
            rl.close();
            oauth2Client.getToken(code, (err, token) => {
                if (err)
                    return reject(`Error while trying to retrieve access token: ${err}`)

                oauth2Client.credentials = token

                storeToken(token).then(() => {
                    return resolve(oauth2Client)
                }).catch((err) => {
                    return reject(err)
                })
            })
        })

    })
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
const storeToken = (token) => {
    return new Promise(  (resolve, reject) => {


        try {

            //token = utils.CryptUtil.base64Encode(JSON.stringify(token))
            token = JSON.stringify(token)

            fs.writeFile(TOKEN_PATH, token, (err) => {
                if (err) {
                    return reject(err)
                }
                return resolve('ok')

            })

        } catch (err) {
            
        }

    })
}


class AuthService {

    static run() {
       

        return new Promise((resolve, reject) => {

            if (_auth == null) {
                credentialServiceInit().then((auth) => {
                    _auth = auth
                    return resolve(auth)
                }).catch((err) => {
                    return reject(err)
                })

            } else {
                return resolve(_auth)
            }

        })




    }
}



module.exports = AuthService