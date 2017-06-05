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
  body.style.color = '#666'
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
  logo.onclick = function() { request('/photos', 'GET', loadPhotos) }

  heading.style.display = 'inline-block'
  heading.style.margin = '0px auto'
  heading.style.lineHeight = `${height}px`
  heading.style.fontWeight = 'lighter'
  heading.style.padding = '0 16px'
  heading.style.cursor = 'pointer'
  heading.style.color = '#444'
  heading.innerText = 'ht.js'
  heading.onclick = function() { request('/resume', 'GET', loadHTML) }
  
  header.changeHeading = function(_heading, themeColor) {
    heading.innerText = _heading
    heading.style.color = themeColor
  }
  header.changeLogo = function(src) {
    logo.src = src
  }
  header.loading = function(isLoading) {
    if (isLoading)
      heading.className = 'loading'

    else
      heading.classList.remove('loading')
  }

  header.appendChild(logo)
  header.appendChild(heading)

  return header
}

var Ticker = function(navHeight) {
  var ticker = document.createElement('aside')
  ticker.style.overflow = 'hidden'
  ticker.style.borderBottom = '2px solid #cfcfd6'

  var innerflow = document.createElement('div')
  innerflow.style.width = '100%'
  innerflow.style.overflowX = 'scroll'
  innerflow.style.whiteSpace = 'nowrap'
  innerflow.style.backgroundColor = '#fff'

  var quote = document.createElement('em')
  quote.style.lineHeight = `${navHeight}px`
  quote.style.margin = '0 8px'

  var arrow = document.createElement('span')
  arrow.style.cursor = 'pointer'
  arrow.style.marginRight = '8px'
  arrow.style.padding = '0px 8px'
  arrow.style.opacity = 0
  arrow.onclick = function() { request('/quotes', 'GET', loadHTML)}
  arrow.innerText = '➔'
  
  var noGradient = 'box-shadow: none'
  var scrollbarHeight = 30 // innerflow.offsetHeight - innerflow.clientHeight
  innerflow.style.height = `${navHeight + scrollbarHeight}px`
  ticker.style.height = `${navHeight}px`
  
  ticker.addQuote = function(_quote) {
    quote.innerHTML = _quote
    arrow.style.opacity = 1
  }

  gradient()
  innerflow.onscroll = function () {
      gradient()
  }
  window.onresize = function () {
      if (innerflow.scrollLeft + innerflow.scrollWidth - innerflow.clientWidth == 0)
          innerflow.style.cssText += noGradient
      else gradient()
  }

  function gradient() {
      innerflow.style.cssText += 'box-shadow: #888 -' + maxGrad(innerflow.scrollWidth - innerflow.clientWidth - innerflow.scrollLeft) + 'px 0px 40px -40px inset, #888 ' + maxGrad(innerflow.scrollLeft) + 'px 0px 40px -40px inset'
  }
    function maxGrad(val) {
        if (val >= 56) return 56
        else return val
    }
  innerflow.appendChild(quote)
  innerflow.appendChild(arrow)
  ticker.appendChild(innerflow)

  return ticker
}

var Main = function() {
  var main = document.createElement('main')
  main.style.overflow = 'auto'

  window.onresize = function () {
    main.style.minHeight = `${document.documentElement.clientHeight - document.getElementsByTagName('header')[0].offsetHeight - document.getElementsByTagName('aside')[0].offsetHeight - document.getElementsByTagName('footer')[0].offsetHeight}px`
  }
  return main
}

var Footer = function(height, color) {
  var footer = document.createElement('footer')
  footer.style.lineHeight = `${height}px`
  footer.style.borderTop = '2px solid #e3e3e8'
  footer.style.backgroundColor = color

  return footer
}

function request(url, method, callback) {
  Header.loading(true)
  var httpRequest = new XMLHttpRequest()

  httpRequest.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200)
      callback(this.responseText)
  }
  httpRequest.open(method, url)
  httpRequest.send()
}
      
function loadPage(res) {
  var Person = JSON.parse(res)

  Html.changeTitle(Person.name)
  Header.changeLogo(Person.photo)
  Header.changeHeading(Person.style.icon, Person.style.colors.accent)
  Header.loading(false)
}

function loadHTML(res) {
  Main.innerHTML = res
  Header.loading(false)
}

function loadPhotos(res) {
  var object = JSON.parse(res)
  var instagramPhotos = ""
  Main.innerHTML = ''
  for (let i = 0; i < object.data.length; i++) {
    var tmp = document.createElement('img')
    tmp.style.cursor = 'pointer'
    tmp.className = 'ig'
    tmp.src = object.data[i].images.low_resolution.url
    tmp.onclick = function() { location.href = object.data[i].link }
    Main.appendChild(tmp)
  }
  Header.loading(false)
}