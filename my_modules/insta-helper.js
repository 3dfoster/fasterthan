const getHelper = require('./get-helper')

exports.writeCSV = function(token) {
  getHelper.json(token, () => {
    rawData = JSON.parse(rawData)
    let line = "thumbnailUrl,Url,likes\n"
    for (let i = 0; i < rawData.data.length; i++) {
      line += rawData.data[i].images.low_resolution.url + ',' + rawData.data[i].link + ',' + rawData.data[i].likes.count + '\n'
    }

    fs.writeFile('ig.csv', line, err => {
      if (err) throw err
    })
  })
}