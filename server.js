// Libraries
const bodyParser = require('body-parser')
const Filter = require('bad-words')
const mongoose = require('mongoose')
const express = require('express')
const https = require('https')
const fs = require('fs')

let resume = fs.readFileSync('views/resume.html')
let addquote = fs.readFileSync('views/addquote.html')

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
      "accent": "#6666ff",
      "background": "#e6e6ff"
    },
    "icon": "☣"
  }
}
const app = express()

app.use(express.static('public'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Swearjar
let filter = new Filter({ placeHolder: '&#128520;'})

app.get('/resume', (req, res) => {
  res.send(resume)
})

app.get('/david', (req, res) => {
  res.send(JSON.stringify(David))
})

app.get('/quotes', (req, res) => {
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
})

app.get('/quotes/faster', (req, res) => {
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
    resp.on('data', (chunk) => rawData += chunk)
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
  db.once('open', function () {
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

app.listen(port, () => {
  console.log("Server started at http://localhost:" + port)
})