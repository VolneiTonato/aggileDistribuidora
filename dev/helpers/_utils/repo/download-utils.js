const request = require('request')
const url = require('url')
const path = require('path')
const fs = require('fs')
const directoryUtil = require('./directory-util')
const jimp = require('jimp')



let pathPublic = `${__dirname}/../../../public/`

class DownloadUtil {

    static async crop(realPathImage, resize = {}) {

        jimp.read(realPathImage).then((image) => {

            image.contain(resize.w, resize.h)
                .quality(100)
                .background(0xFFFFFFFF)
                .rgba(true)
                .deflateStrategy(3)
                .write(realPathImage)

            return Promise.resolve({ fullPath: realPathImage, image: image })

        }).catch((err) => {

            return Promise.reject(err)
        })
    }

    static downloadImageAndResize(fileUrl, pathSave, fileNameAux, resize){
        return new Promise((resolve, reject) => {
            DownloadUtil.start(fileUrl, pathSave, fileNameAux)
            .then(data => {
                DownloadUtil.crop(data.fullPath, resize).then(data => {
                    return resolve(data)
                }).catch(err => {
                    return reject(err)
                })
            }).catch(err => {
                return err
            })
        })
    }


    static jimpDownloadResize(fileUrl, pathSave, fileNameAux, resize) {
        return new Promise((resolve, reject) => {

            

            let r = request({ url: fileUrl, encoding: null }).on('response', async buffer => {

                let filename = ''

                directoryUtil.createRecursive(pathSave)


                filename = fileNameAux || `[${titulo}] - ${filename}`

                let realPath = path.join(`${pathPublic}${pathSave}`, filename)


                let crop = () => {
                    jimp.read(realPath).then((image) => {

                        image.contain(resize.w, resize.h)
                            .quality(100)
                            .background(0xFFFFFFFF)
                            .rgba(true)
                            .deflateStrategy(3)
                            .write(realPath)

                        return resolve({ fullPath: realPath, filename: filename, image: image })

                    }).catch((err) => {

                        return reject(err)
                    })
                }


                let w = fs.createWriteStream(`${realPath}`, buffer)



                r.pipe(w)


                w.on('finish', () => {
                    crop()
                })

            })
        })
    }


    static start(fileUrl, pathSave, fileNameAux) {

        return new Promise((resolve, reject) => {


            let r = request(fileUrl).on('response', (response) => {
                try {

                    let filename = ''
                    let contentDisp = response.headers['content-disposition']

                    if (contentDisp && /^attachment/i.test(contentDisp)) {
                        filename = contentDisp.toLowerCase()
                            .split('filename=')[1]
                            .split(';')[0]
                            .replace(/"/g, '');
                    } else {
                        filename = path.basename(url.parse(fileUrl).path)
                    }


                    directoryUtil.createRecursive(pathSave)

                    filename = fileNameAux || `[${titulo}] - ${filename}`

                    let realPath = path.join(`${pathPublic}${pathSave}`, filename)


                    let w = fs.createWriteStream(realPath) 
                    r.pipe(w)

                    w.on('finish', () => {
                        return resolve({fullPath: realPath})
                    })

                } catch (err) {
                    return reject(err)
                }
            })

        })
    }
}


module.exports = DownloadUtil