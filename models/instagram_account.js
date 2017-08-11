var mongoose = require('mongoose')
var Schema = mongoose.Schema

let InstagramAccountSchema = new Schema({
  account: { type: String, maxlength: 32 },
  date: { type: Date, default: Date.now }
})
let InstagramAccount = mongoose.model('InstagramAccount', InstagramAccountSchema)

module.exports = InstagramAccount