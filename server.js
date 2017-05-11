let mongoose = require('mongoose')
let http = require('http')
let fs = require('fs')

let server = http.createServer()
let header = fs.readFileSync('resources/partials/header.html')
let footer = fs.readFileSync('resources/partials/footer.html')
let home = fs.readFileSync('resources/partials/index.html')

let addquote = fs.readFileSync('resources/partials/addquote.html')
let ticker = fs.readFileSync('resources/partials/ticker.html')

let poetry = "<main><h1>Born Too Soon</h1><p>We were born 200 years later, cowboys in space. We ride spaceships to planets like they were cars and we were people 200 years ago driving to another state. Born to a different father, unshackled by demons. You float along a passageway aboard our ship, looking at me as you make your way towards me. I see your face the same as I remember it, and it makes me happy to think about. We were born too soon, to a world not ready for us.</p></main>"

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

let db

server.on('request', (req, res) => {
  let userAgent = req.headers['user-agent']
  let body = []

  req.on('error', () => {
    console.error(err)
    // Parsing chunks of data in a POST request...
  }).on('data', chunk => {
    body.push(chunk)
  }).on('end', () => {
    // The body of a POST request
    body = Buffer.concat(body).toString()

    // GET Router
    if (req.method == 'GET') {
      switch (req.url) {
        case '/':
          res.writeHead(200, { 'Content-Type': 'text/html' })
          res.write(header)

          mongoose.connect('mongodb://localhost/quotes')
          db = mongoose.connection

          db.on('error', console.error.bind(console, 'connection error:'))
          db.once('open', function () {
            Quote.findOne().sort({date: -1}).exec( (err, quote) => {
              if (err) return console.error(err)
              mongoose.disconnect()

              res.write(ticker.toString().replace(/{{quote}}/i, quote.quote))
              res.write(home)
              res.write(footer)
              res.end()
            })
          })
        break

        case '/poetry':
          res.writeHead(200, { 'Content-Type': 'text/html' })
          res.write(header)
          res.write(poetry)
          res.write(footer)
          res.end()
        break

        case '/quotes':
          res.writeHead(200, { 'Content-Type': 'text/html' })
          res.write(header)

          mongoose.connect('mongodb://localhost/quotes')
          db = mongoose.connection

          db.on('error', console.error.bind(console, 'connection error:'))
          db.once('open', function () {
            Quote.find((err, quotes) => {
              if (err) return console.error(err)
              mongoose.disconnect()

              for (var i = quotes.length - 1; i >= 0; i--) {
                res.write('<p>' + JSON.stringify(quotes[i].quote) + '</p>')
              }

              res.write('<a href="/quotes/new">Add new</a>')
              res.write(footer)
              res.end()
            })
          })
        break

        case '/quotes/new':
          res.writeHead(200, { 'Content-Type': 'text/html' })
          res.write(header)
          res.write(addquote)
          res.write(footer)
          res.end()
        break

        default:
          res.writeHead(404, { 'Content-Type': 'text/html' })
          res.write(header)
          res.write("<h1>404</h1><p>The page you're requesting doesn't exist</p>")
          res.write(footer)
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
                res.end("There was an error connecting to our database :(")
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
}).listen(8000)

console.log("Server started at http://localhost:" + server.address().port)
