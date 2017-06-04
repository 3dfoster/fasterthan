var Html = function() {
  var html = document.documentElement

  // Styling
  html.style.padding = '0px'
  html.style.margin = '0px'
  html.style.overflowY = 'scroll'
  html.style.backgroundColor = '#fff'

  html.changeTitle = function(title) {
    document.title = title
  }
  html.changeBackgroundColor = function(accent, bg) {
    html.style.backgroundColor = bg
  }

  return html
}

var Body = function(width, fontFamily, backgroundColor) {
  var body = document.body

  body.style.maxWidth = `${width}px`
  body.style.margin = '0 auto'
  body.style.position = 'relative'
  body.style.fontFamily = 'sans-serif'
  body.style.fontFamily = fontFamily
  body.style.textAlign = 'center'
  body.style.backgroundColor = '#fff'
  body.style.backgroundColor = backgroundColor

  return body
}

var Header = function(height, backgroundColor) {
  var header = document.createElement('header')
  var heading = document.createElement('h1')
  var logo = document.createElement('img')

  header.style.height = `${height}px`
  header.style.borderBottom = '1px solid rgb(238, 238, 238)'
  header.style.backgroundColor = '#fff'
  header.style.backgroundColor = backgroundColor

  logo.style.position = 'absolute'
  logo.style.left = 0
  logo.style.width = `${height}px`
  logo.style.height = `${height}px`
  logo.style.cursor = 'pointer'
  logo.style.backgroundColor = '#888'
  logo.onclick = function() { request('/photos', 'GET', loadPage) }

  heading.style.display = 'inline-block'
  heading.style.margin = '0px auto'
  heading.style.lineHeight = `${height}px`
  heading.style.fontWeight = 'lighter'
  heading.style.padding = '0 16px'
  heading.style.cursor = 'pointer'
  heading.style.color = '#444'
  heading.innerText = 'ht.js'
  heading.onclick = function() { request('/sophia', 'GET', loadPage) }
  
  header.changeHeading = function(_heading, themeColor) {
    heading.innerText = _heading
    heading.style.color = themeColor
  }
  header.changeLogo = function(url, src) {
    logo.onclick = function() { request(url, 'GET', loadPage) }
    logo.src = src
  }

  header.appendChild(logo)
  header.appendChild(heading)

  return header
}

function request(url, method, callback) {
  var httpRequest = new XMLHttpRequest()

  httpRequest.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200)
      callback(JSON.parse(this.responseText))
  }
  httpRequest.open(method, url)
  httpRequest.send()
}
      
function loadPage(res) {
  var Person = res

  Html.changeTitle(Person.name)
  Header.changeLogo('/photos', Person.photo)
  Header.changeHeading(Person.style.icon, Person.style.colors.accent)
}