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
let elastic = fs.readFileSync('views/elastic.html')

let homeScript = fs.readFileSync('indexes/home.js')
let quoteScript = fs.readFileSync('indexes/quotes.js')
let photoScript = fs.readFileSync('indexes/photos.js')
let elasticScript = fs.readFileSync('indexes/elastic.js')

// Ports
let port = process.env.PORT || 8080
let ip = process.env.IP   || '0.0.0.0'

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
      "background": "#fff"
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
    res.write('warn')
})

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

app.get('/elastic', (req, res) => {
  if (req.headers.loaded)
    res.send(elastic)

    else {
      res.write(index.toString()
        .replace('/*ONLOAD-ENTRY*/', elasticScript))
      res.end()
    }

})

app.get('/api/write-csv', (req, res) => {
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
})

app.get('/api/get-csv', (req, res) => {
  let file = fs.readFileSync('ig.csv')
  res.writeHead(200, { 'Content-Type': 'text/html' })
  res.end(file)
})

app.get('*', (req, res) => {
  res.send("<h1>404</h1><p>The page you're requesting doesn't exist")
})
app.listen(port, () => {
  console.log("Server started at http://localhost:" + port)
})