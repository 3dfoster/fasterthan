var mongoose = require('mongoose')
var Schema = mongoose.Schema

var mongoose = require('mongoose')
  , Schema = mongoose.Schema

var chapterSchema = Schema({
  title: {
    type: String,
    required: true
  },
  number: Number,
  story: { type: Schema.Types.ObjectId, ref: 'Story' },
  body: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  img_filename: {
    type: String,
    required: true
  }
});

var storySchema = Schema({
  title: {
    type: String,
    required: true
  },
  chapters: [{ type: Schema.Types.ObjectId, ref: 'Chapter' }]
});

module.exports = mongoose.model('Story', storySchema);
module.exports = mongoose.model('Chapter', chapterSchema);