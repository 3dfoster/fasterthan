var mongoose = require('mongoose')

exports.retrieve = (mode, model, callback) => {
  mongoose.connect('mongodb://genericos:retsfa@ds151461.mlab.com:51461/faster/quotes')
  db = mongoose.connection

  db.on('error', console.error.bind(console, 'connection error:'))
  db.once('open', () => {
    console.log("Connection to Mongo database established")

    switch (mode) {
      case 'save':
        model.save()
        mongoose.disconnect()
        
        callback()
      break

      case 'faster':
        model.findOne({ isFaster: true }).sort({date: -1}).exec( (err, documents) => {
          mongoose.disconnect()
          if (err) return console.error(err)
        
          callback(documents.quote)
        })
      break

      case 'all':
        model.find((err, documents) => {
          mongoose.disconnect()
          if (err) return console.error(err)
        
          callback(documents)
        })
      break
    }
  })
}