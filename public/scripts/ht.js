var Ticker = function(navHeight, accentColor) {
  var ticker = document.createElement('aside')
  ticker.style.overflow = 'hidden'
  ticker.style.borderBottom = '2px solid #cfcfd6'
  
  ticker.addQuote = function(_quote) {
    quote.innerHTML = _quote
    arrow.style.opacity = 1
  }
  ticker.arrowColor = function(_color) {
    arrow.style.color = _color
  }

  var innerflow = document.createElement('div')
  innerflow.style.width = '100%'
  innerflow.style.overflowX = 'scroll'
  innerflow.style.whiteSpace = 'nowrap'

  var quote = document.createElement('em')
  quote.style.lineHeight = `${navHeight}px`
  quote.style.margin = '0 8px'

  var arrow = document.createElement('span')
  arrow.style.cursor = 'pointer'
  arrow.style.marginRight = '8px'
  arrow.style.padding = '0px 8px'
  arrow.style.opacity = 0
  arrow.onclick = function() {
    get('/api/quotes', quotes)
  }
  arrow.innerText = '➔'
  
  var noGradient = 'box-shadow: none'
  var scrollbarHeight = 30 // innerflow.offsetHeight - innerflow.clientHeight
  innerflow.style.height = `${navHeight + scrollbarHeight}px`
  ticker.style.height = `${navHeight}px`
  ticker.arrowColor(accentColor)

  innerflow.appendChild(quote)
  innerflow.appendChild(arrow)
  ticker.appendChild(innerflow)

  return ticker
}

function get(url, callback) {
  Header.loading(true)
  var httpRequest = new XMLHttpRequest()

  httpRequest.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      callback(this.responseText)
    }
  }
  httpRequest.open('GET', url)
  httpRequest.setRequestHeader("loaded", true)
  httpRequest.send()
}