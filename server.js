// Libraries
const bodyParser = require('body-parser')
const favicon = require('serve-favicon')
const Filter = require('bad-words')
const express = require('express')
const path = require('path')
const fs = require('fs')
var mongoose = require('mongoose')

// Load Components
const ui = fs.readFileSync('html/ui.html')
const addquote = fs.readFileSync('html/components/addquote.html')
const header = fs.readFileSync('html/components/header.html')
const aside = fs.readFileSync('html/components/aside.html')
const footer = fs.readFileSync('html/components/footer.html')

// Load Pages
const resume = fs.readFileSync('html/pages/resume.html')
const elastic = fs.readFileSync('html/pages/elastic.html')
const research = fs.readFileSync('html/pages/research.html')
const addpoem = fs.readFileSync('html/pages/addpoem.html')
const vr = fs.readFileSync('html/pages/vrview.html')

// Global variables
const _404 = "<h1>404</h1><p>The page you're requesting doesn't exist</p>"
const filter = new Filter({ placeHolder: '&#128520;'})
let fasterQuote = "I am the mountain rising high."
let fasterToken = 'https://api.instagram.com/v1/users/self/media/recent/?access_token=2343501318.7767022.c73f1316ae944651b78adb3b2f18fff7'
const rootDir = __dirname

// Database
mongoose.connect('mongodb://genericos:retsfa@ds151461.mlab.com:51461/faster')
var db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', function() {
  console.log('Connected to mLab database')
})

// My libraries
let getHelper = require('./my_modules/get-helper')
let instaHelper = require('./my_modules/insta-helper')

// Database models
let Quote = require('./models/quote.js')
let Poem = require('./models/poem.js')

// Ports
let port = process.env.PORT || 3000
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
  Quote.findOne({ isFaster: true }).sort({date: -1}).exec( (err, quotes) => {
    if (err) return console.error(err)
  
    res.write(ui.toString()
    .replace('<!--HEADER-ENTRY-->', header)
    .replace('<!--ASIDE-ENTRY-->', aside.toString().replace('<!--QUOTE-ENTRY-->', '<em>' + quotes.quote + '</em> <a href="/quotes" class="button">➔</a>'))
    .replace('<!--MAIN-ENTRY-->', resume)
    .replace('<!--FOOTER-ENTRY-->', footer))
    res.end()
  })
})

app.get('/poetry', (req, res) => {
  Poem.find((err, poems) => {
    if (err) return console.error(err)

    let poemsDb = `<main style="margin:0px auto; max-width: 480px;"><h1>Poetry</h1>`
    poems.forEach( poem => {
      poemsDb += `<a href="/poetry/${poem.url}"><div class="poem-preview"><img src="/media/${poem.img_filename}"><h2>${poem.title}</h2></div></a>`
    })
    poemsDb += "</main>"

    res.write(ui.toString()
    .replace('<!--HEADER-ENTRY-->', header)
    .replace('<!--MAIN-ENTRY-->', poemsDb)
    .replace('<!--FOOTER-ENTRY-->', footer))
    res.end()
  })
})

app.get('/poetry/new', (req, res, next) => {
  res.write(ui.toString()
  .replace('<!--HEADER-ENTRY-->', header)
  .replace('<!--MAIN-ENTRY-->', addpoem)
  .replace('<!--FOOTER-ENTRY-->', footer))
  res.end()
})

app.post('/poetry/new', (req, res, next) => {
  var poem = new Poem(req.body)
  poem.save()
  res.writeHead(200)
  res.end()
})

app.get('/poetry/:poem', (req, res) => {
  Poem.findOne({ 'url': req.params.poem }, (err, poem) => {
    if (err) return console.error(err)

    var main = `<main><div class="poem">`
    main += `<img src="/media/${poem.img_filename}"/><h1>${poem.title}</h1>`
    main += `<p style="white-space:pre-wrap; text-align:left;">${poem.body}</p></div></main>`

    res.write(ui.toString()
    .replace('<!--HEADER-ENTRY-->', header)
    .replace('<!--MAIN-ENTRY-->', main)
    .replace('<!--FOOTER-ENTRY-->', footer))
    res.end()
  })
})

app.get('/quotes', (req, res) => {

  Quote.find().sort({date: 1}).exec( (err, quotes) => {
    if (err) return console.error(err)

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
      instagramPhotos += `<a href="${object.data[i].link}"><img class="ig" src="${object.data[i].images.thumbnail.url}" /></a>`

    instagramPhotos += "</main>"

    res.write(ui.toString()
    .replace('<!--HEADER-ENTRY-->', header)
    .replace('<!--MAIN-ENTRY-->', instagramPhotos)
    .replace('<!--FOOTER-ENTRY-->', footer))
    res.end()
  })
})

app.get('/vr', (req, res) => {
  res.write(ui.toString()
  .replace('<!--MAIN-ENTRY-->', vr))
  res.end()
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
  
  quote.save()
  res.writeHead(200)
  res.end()
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