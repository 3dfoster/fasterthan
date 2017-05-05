// var mongoose = require('mongoose')
var http = require('http')
var fs = require('fs')

var server = http.createServer()
var avatar = fs.readFileSync('resources/avatar.png')
var page = fs.readFileSync('index.html')

// Define the document schema for Mongoose
// var Schema = mongoose.Schema
// var bookSchema = new Schema({
//   email: String,
//   isbn: Number,
//   buying: Boolean,
//   pin: Number
// })
// var Book = mongoose.model('Book', bookSchema)

/*
Our server object is an EventEmitter
When it receives an HTTP request it emits a 'request' event
".on" hearing the 'request' event emitted from the server
we execute the following code
*/
server.on('request', (req, res) => {
  var userAgent = req.headers['user-agent']
  var body = []

  req.on('error', () => {
    console.error(err)
    // Parsing chunks of data in a POST request...
  }).on('data', chunk => {
    body.push(chunk)
  }).on('end', () => {
    // Alas: the body of a POST request
    body = Buffer.concat(body).toString()

    // GET Router
    if (req.method == 'GET') {
      switch (req.url) {
        case '/':
          res.writeHead(200, { 'Content-Type': 'text/html' })
          // Set HTTP header information
          res.end(page)
        break

        case '/resources/avatar.png':
          // Set HTTP header information
          res.writeHead(200, { 'Content-Type': 'image/png' })
          res.end(avatar)
        break

        // case '/books':
        //   // Connect to MongoDB
        //   mongoose.connect('mongodb://localhost/bukex')
        //   var db = mongoose.connection
        //   db.on('error', console.error.bind(console, 'connection error:'))
        //   db.once('open', function () {
        //     Book.find((err, books) => {
        //       if (err) return console.error(err)

        //       // res.write(page)
        //       res.end(JSON.stringify(books))
        //       mongoose.disconnect()
        //     })
        //   })
        // break

        default:
          res.writeHead(404, { 'Content-Type': 'text/html' })
          res.end("<h1>404</h1><p>The page you're requesting doesn't exist.</p>")
        break
      }
    }

    // POST Router
    if (req.method == 'POST') {
      switch (req.url) {
        case '/books':
          // Create a new mongoose model with the email our user submitted 
          var book = new Book({ email: 'dethicos@jones.com', isbn: body, buying: true, pin: 12345 })

          // Connect to MongoDB
          mongoose.connect('mongodb://localhost/bukex')
          var db = mongoose.connection
          db.on('error', console.error.bind(console, 'connection error:'))
          db.once('open', function () {
            // We've successfully established a conection to the database
            console.log("Connection to Mongo database established")

            // Store our user's email in the database
            book.save( (err, email) => {
              if (err) {
                res.end("There was an error connecting to our database :(")
                return console.error(err)
              }

              res.writeHead(200, { 'Content-Type': 'text/plain' })
              res.end("Your book has been added to the exchange!")
              mongoose.disconnect()
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
}).listen(process.env.PORT)

console.log("Server started at http://localhost:" + server.address().port)
