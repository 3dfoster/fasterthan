// Library Imports
let mongoose = require('mongoose')
let Filter = require('bad-words')
let http = require('http')
let fs = require('fs')

// Load static HTML files into memory
let app = fs.readFileSync('resources/views/app.html')
let resume = fs.readFileSync('resources/views/resume.html')
let addquote = fs.readFileSync('resources/views/addquote.html')
let login = fs.readFileSync('resources/views/login.html')

// Load global variables
let _404 = "<h1>404</h1><p>The page you're requesting doesn't exist</p>"
let password = "gener8c0s"
let mostRecentQuote = "Taco taco taco taco taco, izquierda!"
let filter = new Filter({ placeHolder: '&#128520;'})


// Database ORM model creation

// Initialize mongoDB
let db

// Initialize Schema
let Schema = mongoose.Schema

// Build Quote ORM model
let quoteSchema = new Schema({
  quote: { type: String, maxlength: 128 },
  date: { type: Date, default: Date.now }
})
let Quote = mongoose.model('Quote', quoteSchema)

// Build blog ORM model
let blogSchema = new Schema({
  title:  { type: String, maxlength: 2500 },
  author: String,
  body:   String,
  date: { type: Date, default: Date.now }
})


// Create Server
let server = http.createServer()

// Function call for incoming HTTP request
server.on('request', (req, res) => {
  let userAgent = req.headers['user-agent']
  let body = []

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

          mongoose.connect('mongodb://localhost/quotes')
          db = mongoose.connection

          db.on('error', console.error.bind(console, 'connection error:'))
          db.once('open', function () {
            Quote.findOne().sort({date: -1}).exec( (err, quote) => {
              if (err) return console.error(err)

              if (quote) mostRecentQuote = quote.quote
              
              res.write(app.toString()
              .replace('<!--NAV-ENTRY-->', '<em>' + mostRecentQuote + '</em> <a href="/quotes">&rarr;</a>')
              .replace('<!--MAIN-ENTRY-->', resume))
              res.end()
              mongoose.disconnect()
            })
          })
        break

        case '/quotes':
          res.writeHead(200, { 'Content-Type': 'text/html' })

          mongoose.connect('mongodb://localhost/quotes')
          db = mongoose.connection

          db.on('error', console.error.bind(console, 'connection error:'))
          db.once('open', function () {
            Quote.find((err, quotes) => {
              if (err) return console.error(err)
              mongoose.disconnect()

              let quotesInDatabase = ""

              if (quotes.length) {
                let j = quotes.length - 1
                mostRecentQuote = quotes[j].quote
                while (j > 0) {
                  j--
                  quotesInDatabase += '<p>' + quotes[j].quote + '</p>\n'
                }
              }

              res.write(app.toString().replace('<!--FOOTER-ENTRY-->', addquote)
              .replace('<!--MAIN-ENTRY-->', quotesInDatabase)
              .replace('<!--NAV-ENTRY-->', '<em>' + mostRecentQuote + '</em> <a href="/quotes">&rarr;</a>'))
              res.end()
            })
          })
        break

        case '/login':
          res.writeHead(200, { 'Content-Type': 'text/html' })
          res.write(app.toString().replace('<!--NAV-ENTRY-->', login)
          .replace('<!--MAIN-ENTRY-->', resume))
          res.end()
        break

        case '/interface':
          res.write(app.toString().replace('<!--FOOTER-ENTRY-->', addquote)
          .replace('<!--MAIN-ENTRY-->', resume)
          .replace('<!--NAV-ENTRY-->', '<em>' + "YOLO guides me. YOLO sets me free." + '</em> <a href="/quotes">&rarr;</a>'))
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
          // Create a new mongoose model with the quote our user submitted 
          let quote = new Quote({ quote: filter.clean(body) })

          // Connect to MongoDB
          mongoose.connect('mongodb://localhost/quotes')
          db = mongoose.connection

          db.on('error', console.error.bind(console, 'connection error:'))
          db.once('open', function () {
            // We've successfully established a conection to the database
            console.log("Connection to Mongo database established")

            // Store quote document in the database
            quote.save( (err, quote) => {
              if (err) {
                res.end(app.toString().replace('<!--MAIN-ENTRY-->', '<p>You encountered an error</p>'))
                return console.error(err)
              }
              mongoose.disconnect()

              res.writeHead(200, { 'Content-Type': 'text/plain' })
              res.end("< Quote added >")
            })
          })
        break

        case '/login':
          if (body === password) {
            res.writeHead(200, { 'Content-Type': 'text/plain' })
            res.end("Authentication successful")
          }
          else res.end("Authentication failed")
        break
      }
    }
    // Error handling
    res.on('error', err => {
      console.error(err)
    })

    console.log('Path: \t\t' + req.url)
    console.log('Method: \t' + req.method)
    console.log('User Agent: \t' + userAgent)
    console.log('Request Body: \t' + body)
    console.log('===================================')
  })
<<<<<<< HEAD
}).listen(8080)
=======
}).listen(8080)
>>>>>>> textbox

console.log("Server started at http://localhost:" + server.address().port)