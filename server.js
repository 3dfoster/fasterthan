// Libraries
const express = require('express')
const https = require('https')
const fs = require('fs')

let resume = fs.readFileSync('views/resume.html')

// Ports
let port = process.env.PORT || 8080
let ip = process.env.IP   || '0.0.0.0'

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

app.get('/resume', (req, res) => {
  res.send(resume)
})

app.get('/david', (req, res) => {
  res.send(JSON.stringify(David))
})

app.get('/sophia', (req, res) => {
  res.send(JSON.stringify(Phia))
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

app.listen(port, () => {
  console.log("Server started at http://localhost:" + port)
})