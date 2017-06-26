<<<<<<< HEAD
// Library Imports
let mongoose = require('mongoose')
let Filter = require('bad-words')
let http = require('http')
let https = require('https')
let fs = require('fs')

// Load static HTML files into memory
let app = fs.readFileSync('resources/views/app.html')
let bubbly = fs.readFileSync('resources/views/bubbly.html')
let privacy = fs.readFileSync('resources/views/privacy.html')
let resume = fs.readFileSync('resources/views/resume.html')
let addquote = fs.readFileSync('resources/views/addquote.html')

// OpenShift
let port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080
let ip = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0'

// Load global variables
let _404 = "<h1>404</h1><p>The page you're requesting doesn't exist</p>"
let fasterQuote = "I am the mountain rising high."
let photoQuote = "Memories, reverberating across the echo chamber of my mind."
let filter = new Filter({ placeHolder: '&#128520;'})
// const PORT = process.env.PORT || 8080

// Initialize mongoDB
let db
=======
// Libraries
const bodyParser = require('body-parser')
const Filter = require('bad-words')
const mongoose = require('mongoose')
const express = require('express')
const https = require('https')
const path = require('path')
const fs = require('fs')

let resume = fs.readFileSync('views/resume.html')
let index = fs.readFileSync('views/app.html')
let addquote = fs.readFileSync('views/addquote.html')

let homeScript = fs.readFileSync('indexes/home.js')
let quoteScript = fs.readFileSync('indexes/quotes.js')
let photoScript = fs.readFileSync('indexes/photos.js')

// Ports
let port = process.env.PORT || 8080
let ip = process.env.IP   || '0.0.0.0'
>>>>>>> express

// Initialize Schema
let Schema = mongoose.Schema

// Build Quote ORM model
let quoteSchema = new Schema({
  quote: { type: String, maxlength: 128 },
  date: { type: Date, default: Date.now },
  isFaster: { type: Boolean, default: false },
  addr: { type: String, maxlength: 160, default: 'warn' }
})
let Quote = mongoose.model('Quote', quoteSchema)

let Phia = {
  "name": "Sophia Maria Holmgren",
  "photo": "https://scontent-atl3-1.cdninstagram.com/t51.2885-19/s320x320/14727646_1169168589834186_6905304133377458176_a.jpg",
  "major": "Art",
  "degree": "associate student",
  "school": "Sacramento City College",
  "googleID": "none",
  "style": {
    "font": {
      "family": "sans-serif",
      "alignment": "center",
      "color": "#cc3300"
    },
    "colors": {
      "accent": "pink",
      "background": "#f5f5f0"
    },
    "icon": "❀"
  }
}
let David = {
  "name": "David Alexander Foster",
  "photo": "/images/avatar_240.png",
  "major": "Computer science",
  "degree": "undergraduate",
  "school": "UC Davis",
  "googleID": "l3BrFHMCWeUnr4pM3QZXyHk1dxsysnkdWLmEJRw9mYo",
  "style": {
    "font": {
      "family": "sans-serif",
      "alignment": "center",
      "color": "#444"
    },
    "colors": {
      "accent": "#4d6394",
      "background": "#e6e6ff"
    },
    "icon": "F >"
  }
}

const app = express()

app.use(express.static('public'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Swearjar
let filter = new Filter({ placeHolder: '&#128520;'})

app.get('/', (req,res) => {
    res.write(index.toString()
      .replace('/*ONLOAD-ENTRY*/', homeScript))
    res.end()
})

<<<<<<< HEAD
// Create Server
let server = http.createServer()

// Function call for incoming HTTP request
server.on('request', (req, res) => {
  let userAgent = req.headers['user-agent']
  let body = []
  let addr = req.connection.remoteAddress

  // Parsing request body
  req.on('error', () => {
    console.error(err)
  }).on('data', chunk => {
    body.push(chunk)
  }).on('end', () => {
    body = Buffer.concat(body).toString()

    // GET Router
    if (req.method == 'GET') {
      switch (req.url) {

        case '/':
          res.writeHead(200, { 'Content-Type': 'text/html' })

          mongoose.connect('mongodb://genericos:retsfa@ds151461.mlab.com:51461/faster/quotes')
          db = mongoose.connection

          db.on('error', console.error.bind(console, 'connection error:'))
          db.once('open', () => {
            Quote.findOne({ isFaster: true }).sort({date: -1}).exec( (err, quote) => {
              if (err) return console.error(err)

              if (quote) fasterQuote = quote.quote
              
              res.write(app.toString()
              .replace('<!--NAV-ENTRY-->', '<em>' + fasterQuote + '</em> <a href="/quotes" class="button">➔</a>')
              .replace('<!--MAIN-ENTRY-->', resume))
              res.end()
              mongoose.disconnect()
            })
          })
        break

        case '/quotes':
          res.writeHead(200, { 'Content-Type': 'text/html' })

          mongoose.connect('mongodb://genericos:retsfa@ds151461.mlab.com:51461/faster/quotes')
          db = mongoose.connection

          db.on('error', console.error.bind(console, 'connection error:'))
          db.once('open', () => {
            Quote.find((err, quotes) => {
              if (err) return console.error(err)
              mongoose.disconnect()

              let quotesInDatabase = ""

              if (quotes.length) {
                let j = 0

                while (j <= quotes.length - 1) {
                    if (quotes[j].isFaster == true)
                      fasterQuote = quotes[j].quote

                    else quotesInDatabase += '<p>' + quotes[j].quote + '</p>\n'
                  j++
                }
              }
              quotesInDatabase += addquote

              res.write(app.toString().replace('<!--MAIN-ENTRY-->', quotesInDatabase)
              .replace('<!--NAV-ENTRY-->', '<em>' + fasterQuote + '</em> '))
              res.end()
            })
          })
        break

        case '/quotes/new':
          res.writeHead(200, { 'Content-Type': 'text/html' })
              
              res.write(app.toString()
              .replace('<!--MAIN-ENTRY-->', addquote))
              res.end()
        break

        case '/photos':
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
                let instagramPhotos = ""
                let object = JSON.parse(rawData)
                for (let i = 0; i < object.data.length; i++)
                  instagramPhotos += `<a href="${object.data[i].link}"><img class="ig" src="${object.data[i].images.low_resolution.url}" /></a>`

                res.write(app.toString().replace('<!--MAIN-ENTRY-->', instagramPhotos)
                .replace('<!--NAV-ENTRY-->', '<em>' + photoQuote + '</em> <a href="/quotes" class="button">➔</a>'))
                res.end()
              } catch (e) {
                console.log(e.message)
              }
            });
          }).on('error', e => {
            console.log(`Got error: ${e.message}`)
          })
        break


        case '/elastic-memories':

                res.write(app.toString().replace('<!--MAIN-ENTRY-->', bubbly)
                .replace('<!--NAV-ENTRY-->', '<em>' + photoQuote + '</em> <a href="/quotes" class="button">➔</a>'))
                res.end()
        break

        case '/api/write-csv':
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
                    
                    res.end('file saved!')
                  })
              } catch (e) {
                console.log(e.message)
              }
            });
          }).on('error', e => {
            console.log(`Got error: ${e.message}`)
          })
        break

        case '/api/get-csv':
          let file = fs.readFileSync('ig.csv')
          res.writeHead(200, { 'Content-Type': 'text/html' })
          res.end(file)
        break

        case '/privacy':
          res.writeHead(200, { 'Content-Type': 'text/html' })

          res.write(app.toString()
          .replace('<!--MAIN-ENTRY-->', privacy))
          res.end()
        break

        default:
          res.writeHead(404, { 'Content-Type': 'text/html' })
          res.write(app.toString().replace('<!--MAIN-ENTRY-->', _404))
          res.end()
        break
      }
    }

    // POST Router
    if (req.method == 'POST') {
      switch (req.url) {
        case '/quotes/new':
          let quote = new Quote
          let secret = body.substring(0, 3)

          if (secret == '!ft') {
            body = body.substring(4, body.length)
            quote.isFaster = true
            quote.quote = body
          }
          else {
            if (body.length <= 128)
              quote.quote = filter.clean(body)
=======
app.get('/resume', (req, res) => {
  if (req.headers.loaded)
    res.send(resume)

  else res.redirect('/')
})

app.get('/david', (req, res) => {
  if (req.headers.loaded)
    res.send(JSON.stringify(David))
    
  else res.redirect('/')
})

app.get('/quotes', (req, res) => {
  if (!req.headers.loaded) {
    res.write(index.toString()
      .replace('/*ONLOAD-ENTRY*/', quoteScript))
    res.end()
  }
  
  else {
    mongoose.connect('mongodb://genericos:retsfa@ds151461.mlab.com:51461/faster/quotes')
    db = mongoose.connection

    db.on('error', console.error.bind(console, 'connection error:'))
    db.once('open', () => {
      Quote.find((err, quotes) => {
        if (err) return console.error(err)
        mongoose.disconnect()

        let quotesInDatabase = ""

        if (quotes.length) {
          let j = 0

          while (j <= quotes.length - 1) {
              if (quotes[j].isFaster == true)
                fasterQuote = quotes[j].quote

              else quotesInDatabase += '<p>' + quotes[j].quote + '</p>\n'
            j++
>>>>>>> express
          }
        }
        quotesInDatabase += addquote

        res.send(quotesInDatabase)
      })
    })
  }
})

app.get('/quotes/faster', (req, res) => {
  if (!req.headers.loaded)
    res.redirect('/')
    
  mongoose.connect('mongodb://genericos:retsfa@ds151461.mlab.com:51461/faster/quotes')
  db = mongoose.connection

  db.on('error', console.error.bind(console, 'connection error:'))
  db.once('open', () => {
    Quote.findOne({ isFaster: true }).sort({date: -1}).exec( (err, quote) => {
      if (err) return console.error(err)
      
      let fasterQuote = "In the quivering forest where the shivering dog rest..."

      if (quote) fasterQuote = quote.quote
      
      res.send(fasterQuote)
      mongoose.disconnect()
    })
  })
})

app.get('/photos', (req, res) => {
  if (!req.headers.loaded) {
    res.write(index.toString()
      .replace('/*ONLOAD-ENTRY*/', photoScript))
    res.end()
  }
  
  https.get('https://api.instagram.com/v1/users/self/media/recent/?access_token=2343501318.7767022.c73f1316ae944651b78adb3b2f18fff7', resp => {
    const statusCode = resp.statusCode;
    const contentType = resp.headers['content-type']

    let error
    if (statusCode !== 200)
      error = new Error(`Request Failed.\n` + `Status Code: ${statusCode}`)
    else if (!/^application\/json/.test(contentType))
      error = new Error(`Invalid content-type.\n` + `Expected application/json but received ${contentType}`)
    
    if (error) {
      console.log(error.message)
      resp.respume()
      return
    }

    resp.setEncoding('utf8')
    let rawData = ''
    resp.on('data', chunk => rawData += chunk)
    resp.on('end', () => {
      try {
        res.send(rawData)
      } catch (e) {
        console.log(e.message)
      }
    })
  }).on('error', e => { console.log(`Got error: ${e.message}`)})
})

app.post('/quotes/new', (req, res) => {
  if (!req.headers.loaded)
    res.redirect('/')
    
  let quote = new Quote
  console.log(JSON.stringify(req.body.quote))
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
  db.once('open', () => {
    // We've successfully established a conection to the database
    console.log("Connection to Mongo database established")

    // Store quote document in the database
    quote.save( (err, quote) => {
      if (err)
        return console.error(err)

      mongoose.disconnect()
      res.status(200).send()
    })
  })
})

app.get('*', (req, res) => {
  res.send("<h1>404</h1><p>The page you're requesting doesn't exist")
})
app.listen(port, () => {
  console.log("Server started at http://localhost:" + port)
})