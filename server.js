// Libraries
const bodyParser = require('body-parser')
const Filter = require('bad-words')
const mongoose = require('mongoose')
const express = require('express')
const https = require('https')
const fs = require('fs')

// Static HTML files
const resume = fs.readFileSync('views/resume.html')
const addquote = fs.readFileSync('views/addquote.html')
const privacy = fs.readFileSync('views/privacy.html')
const elastic = fs.readFileSync('views/elastic.js')

// Ports
const port = process.env.PORT || 8080
const ip = process.env.IP   || '0.0.0.0'

// Initialize Schema
const Schema = mongoose.Schema

// Build Quote ORM model
const quoteSchema = new Schema({
  quote: { type: String, maxlength: 128 },
  date: { type: Date, default: Date.now },
  isFaster: { type: Boolean, default: false },
  addr: { type: String, maxlength: 160 }
})
const Quote = mongoose.model('Quote', quoteSchema)

// Swearjar
const filter = new Filter({ placeHolder: '&#128520;'})

// Express app
const app = express()

// Serve static files
app.use(express.static('public'))

// Allow parsing of incoming XMLhttprequests
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/quotes', (req, res) => {
  res.sendFile(__dirname + '/public/index.html')
})

app.get('/photos/*', (req, res) => {
  res.sendFile(__dirname + '/public/index.html')
})

app.get('/privacy', (req, res) => {
  res.sendFile(__dirname + '/public/index.html')
})

app.get('/api/resume', (req, res) => {
  if (req.headers.loaded)
    res.send(resume)

  else res.redirect('/')
})

app.get('/api/david', (req, res) => {
  if (req.headers.loaded)
    res.send(JSON.stringify(David))

  else res.redirect('/')
})

app.get('/api/privacy', (req, res) => {
  if (req.headers.loaded)
    res.send(privacy)

  else res.redirect('/')
})

app.get('/api/quotes', (req, res) => {
  connectMongo('getAll', Quote, quotes => {
    let quotesInDatabase = ""


    for (let i = 0; i < quotes.length; i++) {
        if (!quotes[i].isFaster)
          quotesInDatabase += '<p>' + quotes[i].quote + '</p>\n'
    }

    quotesInDatabase += addquote
    
    res.send(quotesInDatabase)
  })
})

app.get('/api/quotes/faster', (req, res) => {
  if (!req.headers.loaded)
    res.redirect('/')
  
  connectMongo('getFaster', Quote, quote => {
    res.end(quote)
  })
})

app.get('/api/photos/square', (req, res) => {
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
        res.set('content-type', 'application/json')
        res.send(rawData)
      } catch (e) {
        console.log(e.message)
      }
    })
  }).on('error', e => { console.log(`Got error: ${e.message}`)})
})

app.get('/api/photos/elastic', (req, res) => {
  if (req.headers.loaded) {
    res.set('content-type', 'application/javascript')
    res.send(elastic)
  }

  else res.redirect('/')
})

app.get('/api/elastic/write', (req, res) => {
  writeCSV()
  res.end('File saved!')
})

app.get('/api/elastic/get', (req, res) => {
  let file = fs.readFileSync('ig.csv')
  res.write(file)
  res.end()
})

app.post('/quotes/new', (req, res) => {
  if (!req.headers.loaded)
    res.redirect('/')
    
  let quote = new Quote
  let secret = req.body.quote.substring(0, 3)

  if (secret == '!ft') {
    req = req.body.quote.substring(4, req.length)
    quote.isFaster = true
    quote.quote = req
  }
  else
    quote.quote = filter.clean(req.body.quote)
  
  // Save quote in Mongo database
  connectMongo('save', quote, () => {
    res.status(200).send()
  })
})

// Requests to any URL not defined is sent a 404
app.get('*', (req, res) => {
  res.status(404).send("<h1>404</h1><p>The page you're requesting doesn't exist")
})
app.listen(port, () => {
  console.log("Server started at http://localhost:" + port)
})

function connectMongo(mode, model, callback) {
  mongoose.connect('mongodb://genericos:retsfa@ds151461.mlab.com:51461/faster/quotes')
  db = mongoose.connection

  db.on('error', console.error.bind(console, 'connection error:'))
  db.once('open', () => {
    console.log("Connection to Mongo database established")

    switch (mode) {
      case 'save':
        model.save()
        mongoose.disconnect()
      break

      case 'getFaster':
        model.findOne({ isFaster: true }).sort({date: -1}).exec( (err, documents) => {
          mongoose.disconnect()
          if (err) return console.error(err)
        
          callback(documents.quote)
        })
      break

      case 'getAll':
        model.find((err, documents) => {
          mongoose.disconnect()
          if (err) return console.error(err)
        
          callback(documents)
        })
      break
    }
  })
}

function writeCSV() {
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
          })
      } catch (e) {
        console.log(e.message)
      }
    });
  }).on('error', e => {
    console.log(`Got error: ${e.message}`)
  })
}
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