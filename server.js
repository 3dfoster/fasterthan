// Libraries
const bodyParser = require('body-parser')
const favicon = require('serve-favicon')
const Filter = require('bad-words')
const mongoose = require('mongoose')
const express = require('express')
const https = require('https')
const path = require('path')
const fs = require('fs')

// Load Components
const ui = fs.readFileSync('html/ui.html')
const addquote = fs.readFileSync('html/components/addquote.html')

// Load Pages
const privacy = fs.readFileSync('html/pages/privacy.html')
const resume = fs.readFileSync('html/pages/resume.html')
const elastic = fs.readFileSync('html/pages/elastic.html')
const research = fs.readFileSync('html/pages/research.html')

// const passwordStrength = fs.readFileSync('resources/research/password-strength-vs-usability.pdf')

// Load global variables
const _404 = "<h1>404</h1><p>The page you're requesting doesn't exist</p>"
const filter = new Filter({ placeHolder: '&#128520;'})
let fasterQuote = "I am the mountain rising high."

// Initialize mongoDB
let db

// Initialize Schema
let Schema = mongoose.Schema

// Build ORM model
let quoteSchema = new Schema({
  quote: { type: String, maxlength: 128 },
  date: { type: Date, default: Date.now },
  isFaster: { type: Boolean, default: false },
  addr: { type: String, maxlength: 160 }
})
let Quote = mongoose.model('Quote', quoteSchema)

// Build ORM model
let InstagramAccountSchema = new Schema({
  account: { type: String, maxlength: 32 },
  date: { type: Date, default: Date.now }
})
let InstagramAccount = mongoose.model('InstagramAccount', InstagramAccountSchema)

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
  res.writeHead(200, { 'Content-Type': 'text/html' })

  mongoose.connect('mongodb://genericos:retsfa@ds151461.mlab.com:51461/faster/quotes')
  db = mongoose.connection

  db.on('error', console.error.bind(console, 'connection error:'))
  db.once('open', () => {
    Quote.findOne({ isFaster: true }).sort({date: -1}).exec( (err, quote) => {
      if (err) return console.error(err)

      if (quote) fasterQuote = quote.quote
      
      res.write(ui.toString()
      .replace('<!--NAV-ENTRY-->', '<em>' + fasterQuote + '</em> <a href="/quotes" class="button">➔</a>')
      .replace('<!--MAIN-ENTRY-->', resume))
      res.end()
      mongoose.disconnect()
    })
  })
})

app.get('/quotes', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' })

  mongoose.connect('mongodb://genericos:retsfa@ds151461.mlab.com:51461/faster/quotes')
  db = mongoose.connection

  db.on('error', console.error.bind(console, 'connection error:'))
  db.once('open', () => {
    Quote.find((err, quotes) => {
      if (err) return console.error(err)
      mongoose.disconnect()

      let quotesInDatabase = "<main>"

      if (quotes.length) {
        let j = 0

        while (j <= quotes.length - 1) {
            if (quotes[j].isFaster == true)
              fasterQuote = quotes[j].quote

            else quotesInDatabase += '<p>' + quotes[j].quote + '</p>\n'
          j++
        }
      }
      quotesInDatabase += addquote + "</main>"

      res.write(ui.toString().replace('<!--MAIN-ENTRY-->', quotesInDatabase)
      .replace('<!--NAV-ENTRY-->', '<em>' + fasterQuote + '</em>  <a href="/quotes" style="opacity:0;" class="button">➔</a>'))
      res.end()
    })
  })
})

app.get('/photos', (req, res) => {
  https.get('https://api.instagram.com/v1/users/self/media/recent/?access_token=2343501318.7767022.c73f1316ae944651b78adb3b2f18fff7', (resp) => {
    const statusCode = resp.statusCode;
    const contentType = resp.headers['content-type']

    let error;
    if (statusCode !== 200) {
      error = new Error(`Request Failed.\n` +
                        `Status Code: ${statusCode}`)
    } else if (!/^application\/json/.test(contentType)) {
      error = new Error(`Invalid content-type.\n` +
                        `Expected application/json but received ${contentType}`)
    }
    if (error) {
      console.log(error.message)
      // consume respponse data to free up memory
      resp.respume()
      return
    }

    resp.setEncoding('utf8')
    let rawData = ''
    resp.on('data', (chunk) => rawData += chunk)
    resp.on('end', () => {
      try {
        mongoose.connect('mongodb://genericos:retsfa@ds151461.mlab.com:51461/faster/quotes')
        db = mongoose.connection

        db.on('error', console.error.bind(console, 'connection error:'))
        db.once('open', () => {
          Quote.findOne({ isFaster: true }).sort({date: -1}).exec( (err, quote) => {
            if (err) return console.error(err)

            if (quote) fasterQuote = quote.quote
            mongoose.disconnect()
            
            let instagramPhotos = ""
            let object = JSON.parse(rawData)
            for (let i = 0; i < object.data.length; i++)
              instagramPhotos += `<a href="${object.data[i].link}"><img class="ig" src="${object.data[i].images.low_resolution.url}" /></a>`

            res.write(ui.toString().replace('<!--MAIN-ENTRY-->', instagramPhotos)
            .replace('<!--NAV-ENTRY-->', '<em>' + fasterQuote + '</em> <a href="/quotes" class="button">➔</a>'))
            res.end()
          })
        })
      } catch (e) {
        console.log(e.message)
      }
    });
  }).on('error', e => {
    console.log(`Got error: ${e.message}`)
  })
})

app.get('/elastic', (req, res) => {
  res.write(ui.toString()
  .replace('<!--MAIN-ENTRY-->', elastic))
  res.end()
})

app.get('/research', (req, res) => {
  mongoose.connect('mongodb://genericos:retsfa@ds151461.mlab.com:51461/faster/quotes')
  db = mongoose.connection

  db.on('error', console.error.bind(console, 'connection error:'))
  db.once('open', () => {
    Quote.findOne({ isFaster: true }).sort({date: -1}).exec( (err, quote) => {
      if (err) return console.error(err)

      if (quote) fasterQuote = quote.quote
      
    res.writeHead(200, { 'Content-Type': 'text/html' })
      res.write(ui.toString()
      .replace('<!--NAV-ENTRY-->', '<em>' + fasterQuote + '</em> <a href="/quotes" class="button">➔</a>')
      .replace('<!--MAIN-ENTRY-->', research))
      res.end()
      mongoose.disconnect()
    })
  })
})

app.get('/api/get', (req, res) => {
  const file = fs.readFileSync('ig.csv')
  res.writeHead(200, { 'Content-Type': 'text/html' })
  res.write(file)
  res.end()
})

app.get('/api/write', (req, res) => {
  https.get('https://api.instagram.com/v1/users/self/media/recent/?access_token=2343501318.7767022.c73f1316ae944651b78adb3b2f18fff7', resp => {
    const statusCode = resp.statusCode;
    const contentType = resp.headers['content-type']

    let error;
    if (statusCode !== 200) {
      error = new Error(`Request Failed.\n` +
                        `Status Code: ${statusCode}`)
    } else if (!/^application\/json/.test(contentType)) {
      error = new Error(`Invalid content-type.\n` +
                        `Expected application/json but received ${contentType}`)
    }
    if (error) {
      console.log(error.message)
      // consume response data to free up memory
      resp.respume()
      return
    }

    resp.setEncoding('utf8')
    let rawData = ''
    resp.on('data', (chunk) => rawData += chunk);
    resp.on('end', () => {
      try {
        rawData = JSON.parse(rawData)
        let line = "thumbnailUrl,Url,likes\n"
          for (let i = 0; i < rawData.data.length; i++) {
            line += rawData.data[i].images.low_resolution.url + ',' + rawData.data[i].link + ',' + rawData.data[i].likes.count + '\n'
          }

          fs.writeFile('ig.csv', line, err => {
            if (err) throw err
            res.end('The file has been saved!')
          })
      } catch (e) {
        console.log(e.message)
      }
    });
  }).on('error', e => {
    console.log(`Got error: ${e.message}`)
  })
})

app.get('/privacy', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' })

  res.write(ui.toString()
  .replace('<!--MAIN-ENTRY-->', privacy))
  res.end()
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
  
  // Connect to MongoDB
  mongoose.connect('mongodb://genericos:retsfa@ds151461.mlab.com:51461/faster/quotes')
  db = mongoose.connection

  db.on('error', console.error.bind(console, 'connection error:'))
  db.once('open', function () {
    // We've successfully established a conection to the database
    console.log("Connection to Mongo database established")

    // Store quote document in the database
    quote.save( (err, quote) => {
      if (err) {
        res.end(ui.toString().replace('<!--MAIN-ENTRY-->', '<p>You encountered an error</p>'))
        return console.error(err)
      }
      mongoose.disconnect()

      res.writeHead(200, { 'Content-Type': 'text/plain' })
      res.end()
    })
  })
})

app.get('/api/get', (req, res) => {
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