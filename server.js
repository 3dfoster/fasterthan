let mongoose = require('mongoose')
let http = require('http')
let fs = require('fs')

let server = http.createServer()
let app = fs.readFileSync('resources/partials/app.html')
let resume = fs.readFileSync('resources/partials/resume.html')
let addquote = fs.readFileSync('resources/partials/addquote.html')

let _404 = "<h1>404</h1><p>The page you're requesting doesn't exist</p>"

let Schema = mongoose.Schema
let quoteSchema = new Schema({
  quote: { type: String, maxlength: 128 },
  date: { type: Date, default: Date.now }
})
let Quote = mongoose.model('Quote', quoteSchema)

let blogSchema = new Schema({
  title:  { type: String, maxlength: 2500 },
  author: String,
  body:   String,
  date: { type: Date, default: Date.now }
})

// Initialize mongoDB
let db

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
              mongoose.disconnect()
              
              res.write(app.toString()
              .replace('<!--NAV-ENTRY-->', '<em>' + quote.quote + '</em> <a href="/quotes">&rarr;</a>')
              .replace('<!--MAIN-ENTRY-->', resume))
              res.end()
            })
          })
        break

        case '/poetry':
          res.writeHead(200, { 'Content-Type': 'text/html' })
          res.write(app.toString().replace('<!--MAIN-ENTRY-->', poetry))
          res.end()
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

              let str = ""
              for (var i = quotes.length - 1; i >= 0; i--)
                str += '<p>' + JSON.parse(JSON.stringify(quotes[i].quote)) + '</p>'

              res.write(app.toString().replace('<!--NAV-ENTRY-->', addquote)
              .replace('<!--MAIN-ENTRY-->', str))
              res.end()
            })
          })
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
          let quote = new Quote({ quote: body })

          // Connect to MongoDB
          mongoose.connect('mongodb://localhost/quotes')
          db = mongoose.connection

          db.on('error', console.error.bind(console, 'connection error:'))
          db.once('open', function () {
            // We've successfully established a conection to the database
            console.log("Connection to Mongo database established")

            // Store our user's email in the database
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
}).listen(8080)

console.log("Server started at http://localhost:" + server.address().port)