// Libraries
const bodyParser = require('body-parser')
const favicon = require('serve-favicon')
const Filter = require('bad-words')
const express = require('express')
const path = require('path')
const fs = require('fs')

// Load Components
const ui = fs.readFileSync('html/ui.html')
const addquote = fs.readFileSync('html/components/addquote.html')
const header = fs.readFileSync('html/components/header.html')
const aside = fs.readFileSync('html/components/aside.html')
const footer = fs.readFileSync('html/components/footer.html')

// Load Pages
const privacy = fs.readFileSync('html/pages/privacy.html')
const resume = fs.readFileSync('html/pages/resume.html')
const elastic = fs.readFileSync('html/pages/elastic.html')
const research = fs.readFileSync('html/pages/research.html')

// Load global variables
const _404 = "<h1>404</h1><p>The page you're requesting doesn't exist</p>"
const filter = new Filter({ placeHolder: '&#128520;'})
let fasterQuote = "I am the mountain rising high."
let fasterToken = 'https://api.instagram.com/v1/users/self/media/recent/?access_token=2343501318.7767022.c73f1316ae944651b78adb3b2f18fff7'

// Database
let db

// My libraries
let getHelper = require('./my_modules/get-helper')
let mongoHelper = require('./my_modules/mongo-helper')
let instaHelper = require('./my_modules/insta-helper')

// Database models
let Quote = require('./models/quote.js')
let Post = require('./models/post.js')
let InstagramAccount = require('./models/instagram_account.js')

// Ports
let port = process.env.PORT || 8080
let ip = process.env.IP || '0.0.0.0'

// Express app
const app = express()

// Serve static files and favicon
app.use(express.static('public'))
app.use(favicon(path.join(__dirname, 'public/icons', 'favicon.ico')))

// Allow parsing of incoming XMLhttprequests
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/', (req, res) => {
  mongoHelper.retrieve('faster', Quote, quote => {
    if (quote) fasterQuote = quote
    
    res.write(ui.toString()
    .replace('<!--HEADER-ENTRY-->', header)
    .replace('<!--ASIDE-ENTRY-->', aside.toString().replace('<!--QUOTE-ENTRY-->', '<em>' + fasterQuote + '</em> <a href="/quotes" class="button">➔</a>'))
    .replace('<!--MAIN-ENTRY-->', resume)
    .replace('<!--FOOTER-ENTRY-->', footer))
    res.end()
  })
})

app.get('/quotes', (req, res) => {

  mongoHelper.retrieve('all', Quote, quotes => {
    let quotesInDatabase = "<main>"
    let j = 0

    while (j <= quotes.length - 1) {
        if (quotes[j].isFaster == true)
          fasterQuote = quotes[j].quote

        else quotesInDatabase += '<p>' + quotes[j].quote + '</p>\n'
      j++
    }
    quotesInDatabase += addquote + "</main>"

    res.write(ui.toString()
    .replace('<!--HEADER-ENTRY-->', header)
    .replace('<!--ASIDE-ENTRY-->', aside.toString().replace('<!--QUOTE-ENTRY-->', '<em>' + fasterQuote + '</em> <a href="/quotes" class="button" style="opacity: 0">➔</a>'))
    .replace('<!--MAIN-ENTRY-->', quotesInDatabase)
    .replace('<!--FOOTER-ENTRY-->', footer))
    res.end()
  })
})

app.get('/photos', (req, res) => {
  getHelper.json( fasterToken, object => {
    let instagramPhotos = "<main>"
    for (let i = 0; i < object.data.length; i++)
      instagramPhotos += `<a href="${object.data[i].link}"><img class="ig" src="${object.data[i].images.low_resolution.url}" /></a>`

    instagramPhotos += "</main>"

    res.write(ui.toString()
    .replace('<!--HEADER-ENTRY-->', header)
    .replace('<!--MAIN-ENTRY-->', instagramPhotos)
    .replace('<!--FOOTER-ENTRY-->', footer))
    res.end()
  })
})

app.get('/elastic', (req, res) => {
  res.write(ui.toString()
  .replace('<!--HEADER-ENTRY-->', header)
  .replace('<!--MAIN-ENTRY-->', elastic)
  .replace('<!--FOOTER-ENTRY-->', footer))
  res.end()
})

app.get('/research', (req, res) => {
  res.write(ui.toString()
  .replace('<!--HEADER-ENTRY-->', header)
  .replace('<!--MAIN-ENTRY-->', research)
  .replace('<!--FOOTER-ENTRY-->', footer))
  res.end()
})

app.get('/privacy', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' })

  res.write(ui.toString()
  .replace('<!--HEADER-ENTRY-->', header)
  .replace('<!--MAIN-ENTRY-->', privacy)
  .replace('<!--FOOTER-ENTRY-->', footer))
  res.end()
})

app.get('/api/get', (req, res) => {
  const file = fs.readFile('ig.csv', (err, data) => {
    res.write(data)
    res.end()
  })
})

app.get('/api/write', (req, res) => {
  instaHelper.writeCSV(fasterToken)
  res.end('File saved!')
})

app.post('/quotes/new', (req, res) => {
  console.log(req.body)
  let quote = new Quote
  let secret = req.body.quote.substring(0, 3)

  if (secret == '!ft') {
    req = req.body.quote.substring(4, req.length)
    quote.isFaster = true
    quote.quote = req
  }
  else
    quote.quote = filter.clean(req.body.quote)

  mongoHelper.retrieve('save', quote, () => {
    res.writeHead(200, { 'Content-Type': 'text/plain' })
    res.end()
  })
})

app.get('*', (req, res) => {
  res.status(404)
  res.write(ui.toString()
  .replace('<!--MAIN-ENTRY-->', _404))
  res.end()
})
app.listen(port, () => {
  console.log("Server started at http://localhost:" + port)
})