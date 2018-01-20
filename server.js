// Libraries
const bodyParser = require('body-parser')
const favicon = require('serve-favicon')
const express = require('express')
const path = require('path')
const fs = require('fs')

// Load Components
const ui = fs.readFileSync('html/ui.html')
const header = fs.readFileSync('html/components/header.html')
const aside = fs.readFileSync('html/components/aside.html')
const footer = fs.readFileSync('html/components/footer.html')

// Load Pages
const index = fs.readFileSync('html/pages/index.html')

// Load global variables
const _404 = "<h1>404</h1><p>The page you're requesting doesn't exist</p>"

// Database
let db

// My libraries
let getHelper = require('./my_modules/get-helper')
let mongoHelper = require('./my_modules/mongo-helper')
let instaHelper = require('./my_modules/insta-helper')

// Database models
let Quote = require('./models/quote.js')
let Post = require('./models/post.js')
let InstagramAccount = require('./models/instagram_account.js')

// Ports
let port = process.env.PORT || 3000
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
  res.write(ui.toString()
  .replace('<!--MAIN-ENTRY-->', index))
  res.end()
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