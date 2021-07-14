const puppeteer = require('puppeteer')
const hb = require('handlebars')
const axios = require('axios')
const fastify = require('fastify')({ logger: true })

async function generate(reply, { data, template }) {
  const { data: rawTemplate } = await axios({ method: 'get', url: template });

  const engine = hb.compile(rawTemplate, { strict: true });
  const html = engine(data);
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(html);
  const stream = await page.pdf({
    format: 'A4', 
    preferCSSPageSize: true,
    printBackground: true,
    landscape: true
  })
  await browser.close();
  reply.type('application/pdf').send(stream);
}

fastify.post('/certificado', (request, reply) => generate(reply, request.body))

fastify.listen(process.env.PORT, '0.0.0.0', function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  fastify.log.info(`server listening on ${address}`)
})