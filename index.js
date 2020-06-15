const puppeteer = require('puppeteer')
const hb = require('handlebars')
const axios = require('axios')

async function getTemplateHtml(url) {
 return await axios({ method: 'get', url })
}

async function generatePdf(reply, data, template) {
    getTemplateHtml(template)
        .then(async (response) => {
            const res = response.data;
            console.log("Compiling the template with handlebars")
            const template = hb.compile(res, { strict: true });
            const html = template(data);
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            await page.setContent(html);
            const stream = await page.pdf({ format: 'A4' })
            await browser.close();
            console.log("PDF Generated")
            reply.type('application/pdf').send(stream);
        })
        .catch(err => {
            console.error(err);
            reply.send(err);
        });
}

module.exports = generatePdf