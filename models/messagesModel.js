const mongoose = require('mongoose');

const { Schema } = mongoose;

const MessageSchema = new Schema({
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: String,
    default: '',
  },
});

module.exports = mongoose.model('Message', MessageSchema);
