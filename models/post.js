var mongoose = require('mongoose')
var Schema = mongoose.Schema

let postSchema = new Schema({
  title: { type: String, maxlength: 80 },
  subtitle: { type: String, maxlength: 96 },
  date: { type: Date, default: Date.now },
  body: String,
  tags: [{type: Schema.ObjectId, ref: 'Tags'}]
})

// Virtual for book's URL
postSchema
.virtual('url')
.get(function () {
  return '/blog/' + this._id;
})

let post = mongoose.model('Post', postSchema)

module.exports = post