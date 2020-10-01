const request = require('request');
const prompt = require('prompt');
const fs = require('fs');
const unzipper = require('unzipper');
const PDFDocument = require('pdfkit');
const path = require('path');

prompt.start();

prompt.get([
  {
    name: 'name',
    required: true,
  },
  {
    name: 'chapters',
    required: true,
  },
], async (error, result) => {
  for (let i = 1; i <= result.chapters; i++) {
    const name = `${result.name}_${i}`;
    const filePath = `./downloads/${name}.zip`;
    const file = fs.createWriteStream(filePath);

    const url = `http://images.mangafreak.net:8080/downloads/${name}`;

    await new Promise((resolveRequest) => {
      request({ url, gzip: true })
        .pipe(file)
        .on('finish', async () => {
          const dir = `./downloads/${name}`;

          fs.createReadStream(filePath)
            .pipe(unzipper.Extract({ path: dir }))
            .on('entry', (entry) => entry.autodrain())
            .promise()
            .then(() => {
              fs.unlinkSync(filePath);

              new Promise((resolvePdf) => fs.readdir(dir, (err, files) => {
                const doc = new PDFDocument({ autoFirstPage: false });

                doc.pipe(fs.createWriteStream(`${dir.split('_').join(' ')}.pdf`));

                for (let ii = 1; ii <= files.length; ii++) {
                  const imagePath = path.join(__dirname, `${dir}/${name.toLowerCase()}_${ii}.jpg`);

                  const img = doc.openImage(imagePath);
                  doc.addPage({ size: [img.width, img.height] }).image(imagePath, 0, 0);

                  fs.unlinkSync(imagePath);
                }

                doc.end();

                resolvePdf();
              }))
                .then(() => {
                // UnhandledPromiseRejectionWarning: Error: EPERM: operation not permitted
                // fs.unlinkSync(path.join(__dirname, 'downloads/' + name));
                });
            }).catch((err)=> console.log(err))
            ;

          resolveRequest();
        });
    });
  }
});
