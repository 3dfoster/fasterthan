var mongoose = require('mongoose')
var Schema = mongoose.Schema

let tagSchema = new Schema({
  name: { type: String, maxlength: 80, required: true },
})

// Virtual for book's URL
tagSchema
.virtual('url')
.get(function () {
  return '/blog/tags/' + this._id;
})

let tags = mongoose.model('Tags', tagSchema)

module.exports = tags