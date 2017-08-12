const https = require('https')

exports.lastTwenty = callback => {
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
        callback(JSON.parse(rawData))
      } catch (e) {
        console.log(e.message)
      }
    })
  }).on('error', e => { console.log(`Got error: ${e.message}`)})
}