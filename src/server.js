const puppeteer = require('puppeteer')
const hb = require('handlebars')
const axios = require('axios')
const fastify = require('fastify')({ logger: true })

const fs = require('fs')
const path = require('path')
const utils = require('util')
const readFile = utils.promisify(fs.readFile)

async function generate(reply, { data, template }) {
  const { data: rawTemplate } = await axios({ method: 'get', url: template });
  // const res = response.data;
  // const invoicePath = path.resolve("./certificado.html");
  // const rawTemplate =  await readFile(invoicePath, 'utf8');

  const engine = hb.compile(rawTemplate, { strict: true });
  const html = engine(data);
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(html);
  const stream = await page.pdf({ 
    // path: 'certificado2.pdf',  
    format: 'A4', 
    preferCSSPageSize: true,
    printBackground: true,
    landscape: true
  })
  await browser.close();
  reply.type('application/pdf').send(stream);
}

fastify.get('/', (request, reply) => reply.send({ hello: 'world' }))
fastify.post('/certificado', (request, reply) => generate(reply, request.body))

fastify.post('/forms', (request, reply) => {
  console.log('Forms Office')
  console.log(request.body)
  reply.send({ success: true })
})

fastify.listen(3000, function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  fastify.log.info(`server listening on ${address}`)
})

// generate(null, {
//   data: {
//     name: 'Christiano Milfont'
//   }
// })