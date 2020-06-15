const fs = require('fs')
const path = require('path')
const pug = require('pug')
const Puppetter = require('puppeteer')
const Chromium = require('chromium')
const { uuid: GenerateUUID } = require('../crypt-util')
const directoryUtil = require('../directory-util')


const optionsChromium = [
    "--no-sandbox",
    "--headless",
    "--disable-gpu",
    "--disable-translate",
    "--disable-extensions",
    "--disable-background-networking",
    "--safebrowsing-disable-auto-update",
    "--disable-sync",
    "--metrics-recording-only",
    "--disable-default-apps",
    "--no-first-run",
    "--mute-audio",
    "--hide-scrollbars"
]


const tempDir = path.join(`${__dirname}`, 'temp')


const privateMethods = {
    generatePDFToHTMLFileLocal: Symbol('generatePDFToHTMLFileLocal'),
    compilePugToHtml: Symbol('compilePugToHtml'),
    whirteFileHTMLInPath: Symbol('whirteFileHTMLInPath'),
    generateNameFile: Symbol('generateNameFile')

}


class ChromePDF {
    constructor() {

    }

    [privateMethods.generateNameFile]() {
        return GenerateUUID().replace(/-/ig, '')
    }


    async [privateMethods.whirteFileHTMLInPath](fileName) {

        return new Promise((resolve, reject) => {

            try {

                fs.writeFile(`${tempDir}/${fileName}.html`, this._html, (err) => {
                    if (err)
                        return reject(err)
                    return resolve()
                })
            } catch (err) {
                reject(err)
            }
        })
    }


    async [privateMethods.generatePDFToHTMLFileLocal]() {

        return new Promise((resolve, reject) => {




            (async () => {

                try {



                    let fileName = this[privateMethods.generateNameFile]()

                    await this[privateMethods.whirteFileHTMLInPath](fileName)

                    let browser = await Puppetter.launch({ headless: false, args: optionsChromium, executablePath: Chromium.path })

                    let page = await browser.newPage()

                    await page.goto(`file://${tempDir}/${fileName}.html`, { waitUntil: 'load' })

                    await page.pdf({
                        path: `${tempDir}/${fileName}.pdf`, format: "A4", margin: {
                            left: '50',
                            right: '50',
                        },
                    })

                    await browser.close()

                    resolve(fileName)

                } catch (err) {
                    reject(err)
                }

            })()



        })
    }

    async [privateMethods.compilePugToHtml](dir, data) {

        return new Promise((resolve, reject) => {

            if (/(controllers\/..\/views)/.test(dir))
                dir = `${dir.toString().replace(/(controllers\/..\/views)/ig, 'views')}`

            data.FN = global.functionView

            pug.renderFile(`${dir}`, data, (err, html) => {

                if (err)
                    return reject(err)



                return resolve(html)
            })

        })
    }

    async generateFileHTMLAndGetKeyPugTemplate(dir, data) {
        try {

            this._html = await this[privateMethods.compilePugToHtml](dir, data)

            let fileName = this[privateMethods.generateNameFile]()

            await this[privateMethods.whirteFileHTMLInPath](fileName)


            return fileName

        } catch (err) {
            return Promise.reject(err)
        }

    }


    async generateFileAndGetKeyPugTemplate(dir, data) {

        try {

            this._html = await this[privateMethods.compilePugToHtml](dir, data)


            return new Promise((resolve, reject) => {
                this[privateMethods.generatePDFToHTMLFileLocal]()
                    .then((key) => { return resolve(key) })
                    .catch((err) => { return reject(err) })
            })
        } catch (err) {
            return Promise.reject(err)
        }
    }


    async getPdfToKey(key) {
        return new Promise((resolve, reject) => {

            (async () => {

                let path = `${tempDir}/${key}.pdf`

                if (await directoryUtil.fileExists(path) == false)
                    reject('Arquivo inválido para o relatório!')

                fs.readFile(`${path}`, (err, pdf) => {
                    if (err)
                        return reject(err)

                    return resolve(pdf)
                })

            })()

        })
    }

    async getHTMLToKey(key) {
        return new Promise((resolve, reject) => {


            (async () => {



                let path = `${tempDir}/${key}.html`

                if (await directoryUtil.fileExists(path) == false)
                    reject('Arquivo inválido para o relatório!')

                fs.readFile(`${path}`, (err, html) => {
                    if (err)
                        return reject(err)

                    return resolve(html)
                })

            })()

        })
    }
}

module.exports = ChromePDF