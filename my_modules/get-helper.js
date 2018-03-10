const http = require('http')

// Inspired from https://nodejs.org/api/http.html#http_http_get_options_callback
exports.json = function(url, callback) {
  http.get(url, res => {
    const statusCode = res.statusCode
    const contentType = res.headers['content-type']

    let error
    if (statusCode !== 200)
      error = new Error(`Request Failed.\n` + `Status Code: ${statusCode}`)
    else if (!/^application\/json/.test(contentType))
      error = new Error(`Invalid content-type.\n` + `Expected application/json but received ${contentType}`)
    
    if (error) {
      console.log(error.message)
      res.resume()
      return
    }

    res.setEncoding('utf8')
    let rawData = ''
    res.on('data', chunk => rawData += chunk)
    res.on('end', () => {
      try {
        callback(JSON.parse(rawData))
      } catch (e) {
        console.log(e.message)
      }
    })
  }).on('error', e => { console.log(`Got error: ${e.message}`)})
}