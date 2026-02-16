import puppeteer from 'puppeteer'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const htmlPath = path.resolve(__dirname, '../public/presentation/index.html')
const outputPath = path.resolve(__dirname, '../public/presentation/LegalAI-Report.pdf')

async function generatePDF() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })

  const page = await browser.newPage()
  await page.setViewport({ width: 1920, height: 1080 })
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' })

  // Make all slides visible for PDF
  await page.evaluate(() => {
    const slides = document.querySelectorAll('.slide')
    const nav = document.querySelector('.navigation')
    const counter = document.querySelector('.slide-counter')
    const toolbar = document.querySelector('.toolbar')
    if (nav) nav.style.display = 'none'
    if (counter) counter.style.display = 'none'
    if (toolbar) toolbar.style.display = 'none'

    slides.forEach(slide => {
      slide.style.display = 'flex'
      slide.style.position = 'relative'
      slide.style.height = 'auto'
      slide.style.minHeight = '100vh'
      slide.style.pageBreakAfter = 'always'
    })

    document.body.style.overflow = 'visible'
    document.querySelector('.presentation-container').style.height = 'auto'
  })

  await page.pdf({
    path: outputPath,
    format: 'A4',
    landscape: true,
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' },
    preferCSSPageSize: false
  })

  await browser.close()
  console.log(`PDF generated: ${outputPath}`)
}

generatePDF().catch(err => {
  console.error('PDF generation failed:', err)
  process.exit(1)
})
