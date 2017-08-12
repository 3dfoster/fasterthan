var mongoose = require('mongoose')
var Schema = mongoose.Schema

let postSchema = new Schema({
  title: { type: String, maxlength: 640 },
  subtitle: { type: String, maxlength: 640 },
  date: { type: Date, default: Date.now },
  tags: { type: String, maxlength: 160 }
})
let post = mongoose.model('Post', postSchema)

module.exports = post