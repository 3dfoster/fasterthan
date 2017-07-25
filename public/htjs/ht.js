var h1 = function(text, color) {
  var H1 = document.createElement('h1')

  H1.text = function(_text) {
    h1.innerText = _text
  }
  H1.color = function(_color) {
    h1.style.color = _color
  }

  H1.text(text)

  return H1
}

var a = function() {
  var A = document.createElement('a')

  return A
}

var aside = function() {
  var Aside = document.createElement('aside')

  return Aside
}

var header = function(height) {
  var Header = document.createElement('header')

  Header.height = function(_height) {
    Header.style.height = _height
  }

  Header.height(height)

  return Header
}

var Html = function(backgroundColor) {
  var html = document.documentElement

  html.height = html.clientHeight

  // Initialize styling
  html.style.padding = '0px'
  html.style.margin = '0px'
  html.style.overflowY = 'scroll'
  html.style.backgroundColor = backgroundColor

  html.changeTitle = function(title) {
    document.title = title
  }
  html.backgroundColor = function(_backgroundColor) {
    html.style.backgroundColor = _backgroundColor
  }

  return html
}

var Body = function(width, fontFamily, color, backgroundColor) {
  var body = document.body

  body.changeWidth = function(_width) {
    body.style.maxWidth = `${_width}px`
  }

  // Initialize styling
  body.changeWidth(width)
  body.style.margin = '0 auto'
  body.style.position = 'relative'
  body.style.fontFamily = 'sans-serif'
  body.style.fontFamily = fontFamily
  body.style.textAlign = 'center'
  body.style.backgroundColor = backgroundColor

  return body
}

var Header = function(height, borderColor, backgroundColor) {
  var Header = new header(height)
  var heading = new h1('ht.js')
  var logo = document.createElement('img')
  var photoggle = document.createElement('img')
  
  Header.heading = function(_heading, themeColor) {
    heading.innerHTML = _heading
    heading.style.color = themeColor
  }
  Header.logo = function(src) {
    logo.src = src
  }
  Header.loading = function(_isLoading) {
    if (_isLoading)
      heading.className = 'loading'

    else
      heading.classList.remove('loading')
  }
  Header.borderColor = function(_borderColor) {
    Header.style.borderBottom = `1px solid ${_borderColor}`
  }

  // Not sure why setting header height in header function doesn't work but it doesn't
  Header.style.height = `${height}px`
  Header.borderColor(borderColor)
  Header.style.backgroundColor = backgroundColor

  logo.style.position = 'absolute'
  logo.style.left = 0
  logo.style.width = `${height}px`
  logo.style.height = `${height}px`
  logo.style.cursor = 'pointer'
  logo.style.backgroundColor = '#b4b5ca'
  logo.onclick = function() {
    request('/api/photos/square', 'GET', photos)
  }

  photoggle.style.position = 'absolute'
  photoggle.style.right = 0
  photoggle.style.width = `${height}px`
  photoggle.style.height = `${height}px`
  photoggle.style.cursor = 'pointer'
  photoggle.src = '/images/squares_icon.png'
  photoggle.onclick = function() {
    request('/api/photos/elastic', 'GET', elastic)
  }

  heading.style.display = 'inline-block'
  heading.style.margin = '0px auto'
  heading.style.lineHeight = `${height}px`
  heading.style.padding = '0 16px'
  heading.style.cursor = 'pointer'
  heading.style.color = '#444'
  heading.onclick = function() {
    request('/api/resume', 'GET', home)
  }

  Header.appendChild(logo)
  Header.appendChild(heading)
  Header.appendChild(photoggle)

  return Header
}

var Ticker = function(navHeight, accentColor) {
  var ticker = new aside()
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
    request('/api/quotes', 'GET', quotes)
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

var Main = function() {
  var main = document.createElement('main')
  main.style.overflow = 'auto'

  window.onresize = function () {
      Main.style.minHeight = `${Html.height - Header.offsetHeight - Ticker.offsetHeight - Footer.offsetHeight}px`
  }
  return main
}

var Footer = function(height, color, backgroundColor) {
  var footer = document.createElement('footer')
  footer.style.lineHeight = `${height}px`
  footer.style.borderTop = '2px solid #e3e3e8'
  footer.style.backgroundColor = backgroundColor

  footer.color = function(_color) {
    for (var i = 0; i < footer.childNodes.length; i++) {
    footer.childNodes[i].style.color = _color
    }
  }

  for (var i = 0; i < 4; i++) {
    var A = new a()
    A.style.color = color
    A.style.margin = '0 24px'
    
    switch (i) {
      case 0:
        A.href = "mailto:faster@ucdavis.edu"
        A.className = "fa fa-fw fa-envelope-o"
      break

      case 1:
        A.href = "https://www.instagram.com/_u/the.t.u.r.n"
        A.className = "fa fa-fw fa-instagram"
      break

      case 2:
        A.href = "https://gitlab.com/dfoster"
        A.className = "fa fa-fw fa-gitlab"
      break

      case 3:
        A.href = "https://github.com/fasterthan"
        A.className = "fa fa-fw fa-github"
      break
    }

    footer.color(color)

    footer.appendChild(A)
  }
  return footer
}

function elasticity() {
    var canvas = document.getElementsByTagName('svg')[0]
    var main = document.getElementsByTagName('main')[0]
    var Header = document.getElementsByTagName('header')[0]
    var Overflow = document.getElementsByTagName('aside')[0]
    var Footer = 42 // document.getElementsByTagName('footer')[0]
    if (Overflow) document.body.removeChild(Overflow)

    main.style.minHeight = document.documentElement.clientHeight - Header.offsetHeight - Footer + 'px'

    var canvasHeight = document.documentElement.clientHeight - Header.offsetHeight - Footer
    main.style.backgroundImage = 'url(https://s3-us-west-1.amazonaws.com/fasterthan/digital_ripple_white.gif)'


    if (canvasHeight > main.offsetWidth || window.orientation)
        canvas.setAttribute("height", main.offsetWidth)
    else
        canvas.setAttribute("height", canvasHeight)

    canvas.setAttribute("width", main.offsetWidth)

    var svg = d3.select("svg"),
        width = +svg.attr("width"),
        height = +svg.attr("height")

    var format = d3.format(",d")

    var pack = d3.pack()
        .size([width, height])
        .padding(1.5)

    d3.csv(window.location.origin + "/api/elastic", function(d) {
        d.likes = +d.likes
        if (d.likes) return d
    }, function(error, classes) {
        if (error) throw error

        var root = d3.hierarchy({children: classes})
            .sum(function(d) { return d.likes })
            .each(function(d) {
            if (thumbnailUrl = d.data.thumbnailUrl) {
                var thumbnailUrl, i = thumbnailUrl.lastIndexOf(".")
                d.thumbnailUrl = thumbnailUrl
                d.package = thumbnailUrl.slice(0, i)
                d.class = thumbnailUrl.slice(i + 1)
            }
            if (Url = d.data.Url) {
                var Url, i = Url.lastIndexOf(".")
                d.Url = Url
                d.package = Url.slice(0, i)
                d.class = Url.slice(i + 1)
            }
            })

        var node = svg.selectAll(".node")
        .data(pack(root).leaves())
        .enter().append("g")
            .attr("class", "node")
            .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")" })

        node.append("clipPath")
            .attr("id", function(d) { return "clip-" + d.thumbnailUrl })
        .append("circle")
            .attr("r", function(d) { return d.r })

        node.append("a")
            .attr("xlink:href", function(d) { return d.Url })
        .append("image")
            .attr("clip-path", function(d) { return "url(#clip-" + d.thumbnailUrl + ")" })
            .attr("xlink:href", function(d) { return d.thumbnailUrl })
            .attr("x", function(d) { return -d.r })
            .attr("y", function(d) { return -d.r })
            .attr("width", function(d) { return d.r * 2 })
            .attr("height", function(d) { return d.r * 2 })
    })
}