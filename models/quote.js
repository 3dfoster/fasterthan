var mongoose = require('mongoose')
var Schema = mongoose.Schema

let quoteSchema = new Schema({
  quote: { type: String, maxlength: 128 },
  date: { type: Date, default: Date.now },
  isFaster: { type: Boolean, default: false },
  addr: { type: String, maxlength: 160 }
})
let Quote = mongoose.model('Quote', quoteSchema)

module.exports = Quote