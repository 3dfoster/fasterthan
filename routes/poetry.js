var express = require('express')
var readline = require('readline')
var path = require('path')
var fs = require('fs')
var router = express.Router()

// Load Components
const ui = fs.readFileSync('html/ui.html')
const header = fs.readFileSync('html/components/header.html')
const aside = fs.readFileSync('html/components/aside.html')
const footer = fs.readFileSync('html/components/footer.html')

////////////// TO DO //////////////
// Create array of JSON objects where JSON objects have following format:
// image_name: 'jade_goggles.png'
// title: 'Lines in the Sky' -> Remove file type
// body: 'Jade Goggles...' -> Preserve newlines!
///////////////////////////////////

router.get('/', function(req, res, next) {
  // Get name of all poem.txt files in poems directory
  var fileNames = fs.readdirSync('./poems')
  var poems = []
  
  fileNames.forEach( fileName => {
    var poem = {}
    poem.title = fileName.split('.')[0]

    var rl = readline.createInterface({
      input: fs.createReadStream('./poems/' + fileName, "utf8"),
      crlfDelay: Infinity
    });
    
    var i = 0 // image filename is always on first line
    var body
    rl.on('line', (line) => {
      if (i == 0) poem.image_name = line
      if (i > 1) body += line + '\n'
      i++
    }).on('close', () => {
      poem.body = body
      poems.push(poem)
      buildHtml()
    })
  })

  var html
  function buildHtml() {
    poems.forEach( poem => {
      html += `<h1>${poem.title}</h1>`
      html += `<p>${poem.body}</p>`
    })
  
    callback(html)
  }
  
  function callback() {
    res.write(ui.toString()
    .replace('<!--HEADER-ENTRY-->', header)
    // .replace('<!--ASIDE-ENTRY-->', aside.toString().replace('<!--QUOTE-ENTRY-->', '<em>' + fasterQuote + '</em> <a href="/quotes" class="button">➔</a>'))
    .replace('<!--MAIN-ENTRY-->', html)
    .replace('<!--FOOTER-ENTRY-->', footer))
    res.end()
  }
})

router.get('/:poemId', (req, res) => {
})

module.exports = router