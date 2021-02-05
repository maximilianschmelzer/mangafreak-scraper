import fs from 'fs'
import unzipper from 'unzipper'
import PDFDocument from 'pdfkit'
import path from 'path'
import axios from 'axios'

(async () => {
  const startTime = Math.floor(Date.now() / 1000)

  var myArgs = process.argv.slice(2)

  const inputName = myArgs[0]

  if (!inputName) {
    console.log('> title required')
    process.exit()
  }

  let i = 1
  let downloadCount = 0

  const mangaFolder = path.join(path.resolve(), 'downloads', inputName)
  if (!fs.existsSync(mangaFolder)) {
    fs.mkdirSync(mangaFolder)
  }

  while (true) {
    const name = `${inputName}_${i}`
    const base = `downloads/${inputName}`
    const unzippedImagesFolderPath = path.join(path.resolve(), 'downloads', inputName, name)
    const zippedImagesFolderPath = `${unzippedImagesFolderPath}.zip`
    const url = `http://images.mangafreak.net:8080/downloads/${name}`
    const pdfPath = path.join(path.resolve(), 'downloads', inputName, `${name}.pdf`)

    if (fs.existsSync(pdfPath)) {
      console.log('')
      console.log(`> chapter ${i}`)
      console.log('> skipped')
      i++
      continue
    }

    await axios({ method: 'get', url, responseType: 'stream' })
      .then(response => {
        const writeStream = fs.createWriteStream(zippedImagesFolderPath)

        return new Promise((resolve, reject) => {
          response.data.pipe(writeStream)

          writeStream.on('close', () => resolve())
        })
      })

    if (fs.statSync(zippedImagesFolderPath).size === 0) {
      fs.unlinkSync(zippedImagesFolderPath)
      break
    }

    console.log('')
    console.log(`> chapter ${i}`)

    i++
    downloadCount++

    await fs.createReadStream(zippedImagesFolderPath)
      .pipe(unzipper.Extract({ path: unzippedImagesFolderPath }))
      .promise()

    fs.unlinkSync(zippedImagesFolderPath)

    const files = fs.readdirSync(unzippedImagesFolderPath)

    const doc = new PDFDocument({ autoFirstPage: false })

    doc.pipe(fs.createWriteStream(pdfPath))

    for (let i = 1; i <= files.length; i++) {
      const imagePath = path.join(path.resolve(), base, name, `${name.toLowerCase()}_${i}.jpg`)

      const img = doc.openImage(imagePath)

      doc.addPage({ size: [img.width, img.height] }).image(imagePath, 0, 0)
    }

    doc.end()

    fs.rmdirSync(unzippedImagesFolderPath, { recursive: true })

    console.log('> done')
  }

  console.log('')
  console.log(`> finished downloading and converting ${downloadCount} chapters of ${inputName} in ${Math.floor(Date.now() / 1000) - startTime} seconds`)
})()
