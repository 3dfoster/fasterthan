// Library Imports
let mongoose = require('mongoose')
let Filter = require('bad-words')
let http = require('http')
let https = require('https')
let fs = require('fs')

// Load static HTML files into memory
let app = fs.readFileSync('resources/views/app.html')
let privacy = fs.readFileSync('resources/views/privacy.html')
let resume = fs.readFileSync('resources/views/resume.html')
let addquote = fs.readFileSync('resources/views/addquote.html')
let elastic = fs.readFileSync('resources/views/elastic.html')

// Load global variables
let _404 = "<h1>404</h1><p>The page you're requesting doesn't exist</p>"
let fasterQuote = "I am the mountain rising high."
let filter = new Filter({ placeHolder: '&#128520;'})
// const PORT = process.env.PORT || 8080

// Initialize mongoDB
let db

// Initialize Schema
let Schema = mongoose.Schema

// Build Quote ORM model
let quoteSchema = new Schema({
  quote: { type: String, maxlength: 128 },
  date: { type: Date, default: Date.now },
  isFaster: { type: Boolean, default: false },
  addr: { type: String, maxlength: 160 }
})
let Quote = mongoose.model('Quote', quoteSchema)

// Build blog ORM model
let blogSchema = new Schema({
  title:  { type: String, maxlength: 2500 },
  author: String,
  body:   String,
  date: { type: Date, default: Date.now }
})

// Ports
let port = process.env.PORT || 8080
let ip = process.env.IP || '0.0.0.0'

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

              res.write(app.toString().replace('<!--MAIN-ENTRY-->', quotesInDatabase)
              .replace('<!--NAV-ENTRY-->', '<em>' + fasterQuote + '</em>  <a href="/quotes" style="opacity:0;" class="button">➔</a>'))
              res.end()
            })
          })
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

                    res.write(app.toString().replace('<!--MAIN-ENTRY-->', instagramPhotos)
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
        break

        case '/elastic':
          res.write(app.toString()
          .replace('<!--MAIN-ENTRY-->', '<h1 style="display:inline-block;margin:8px auto;">Memories</h1><svg></svg><em>reverberating across the echo chamber of my mind</em>')
          .replace('<!--SCRIPT-ENTRY-->', elastic))
          res.end()

        break

        case '/api/get-csv':
          let file = fs.readFileSync('ig.csv')
          res.writeHead(200, { 'Content-Type': 'text/html' })
          res.write(file)
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
                    res.end('The file has been saved!')
                  })
              } catch (e) {
                console.log(e.message)
              }
            });
          }).on('error', e => {
            console.log(`Got error: ${e.message}`)
          })
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
            quote.quote = filter.clean(body)
            quote.addr = addr
          }
          
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
                res.end(app.toString().replace('<!--MAIN-ENTRY-->', '<p>You encountered an error</p>'))
                return console.error(err)
              }
              mongoose.disconnect()

              res.writeHead(200, { 'Content-Type': 'text/plain' })
              res.end()
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
    console.log('IP: \t\t' + req.connection.remoteAddress)
    console.log('Method: \t' + req.method)
    console.log('User Agent: \t' + userAgent)
    console.log('Request Body: \t' + body)
    console.log('===================================')
  })
}).listen(port, ip)

console.log("Server started at http://localhost:" + port)
