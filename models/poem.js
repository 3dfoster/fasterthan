var mongoose = require('mongoose')
var Schema = mongoose.Schema

let poemSchema = new Schema({
  title: { type: String },
  body: { type: String },
  url: { type: String },
  img_filename: { type: String }
})
module.exports = mongoose.model('Poem', poemSchema)