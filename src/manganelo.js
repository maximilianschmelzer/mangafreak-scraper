import puppeteer from 'puppeteer'
import fs from 'fs'
import path from 'path'
import PDFDocument from 'pdfkit'

(async () => {
    const [ title, firstChapter, lastChapter ] = process.argv.slice(2)

    const basePath = path.join(path.resolve(), 'downloads', 'manganelo')

    if (!fs.existsSync(basePath)) {
        fs.mkdirSync(basePath)
    }

    const titlePath = path.join(basePath, title)

    if (!fs.existsSync(titlePath)) {
        fs.mkdirSync(titlePath)
    }

    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    let chapterPath = ''

    page.on('response', async response => {
        if (response.status() !== 200) {
            return
        }

        if (response.request().resourceType() !== 'image') {
            return
        }

        response.buffer().then(file => {
            const fileName = response.url().split('/').pop()

            const [ name, type ] = fileName.split('.')

            if ('jpg' !== type || isNaN(name)) {
                return
            }

            fs.createWriteStream(path.join(chapterPath, fileName)).write(file)
        })
    })

    for (let i = firstChapter; i < lastChapter; i++) {
        const chapter = `chapter_${i}`
        chapterPath = path.join(titlePath, chapter)
        const chapterPdfPath = path.join(chapterPath, `${i}.jpg`)

        if (fs.existsSync(chapterPdfPath)) {
            continue
        }

        if (!fs.existsSync(chapterPath)) {
            fs.mkdirSync(chapterPath)
        }

        await page.goto(`https://manganelo.com/chapter/${title}/${chapter}`)

        const doc = new PDFDocument({ autoFirstPage: false })

        doc.pipe(fs.createWriteStream(`${chapterPath}.pdf`))

        fs.readdirSync(chapterPath)
            .map(file => file.replace('.jpg', '')) // remove .jpg so chapters can be sorted
            .sort((a, b) => a - b) // sort numbers correctly 1, 2, ... 10 instead if 1, 10, 2, ...
            .map(file => {
            const imagePath = path.join(chapterPath, `${file}.jpg`)
            const image = doc.openImage(imagePath)

            doc.addPage({ size: [image.width, image.height] }).image(imagePath, 0, 0)

            //fs.rmSync(imagePath)
        })

        doc.end()

        //fs.rmdirSync(chapterPath, { recursive: true })
    }

    await browser.close()
})()
