const mongoose = require('mongoose');

const { Schema } = mongoose;

const classTaxonomiesSchema = new Schema({
  profession: String,
  sub: [{
    subject: String,
    topics: [{
      topicName: String,
    }],
    tags: [{
      tagName: String,
    }],
  }],
});

module.exports = mongoose.model('ClassTaxonomies', classTaxonomiesSchema);
