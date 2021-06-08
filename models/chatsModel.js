const mongoose = require('mongoose');

const { Schema } = mongoose;

const ChatsSchema = new Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  recieverId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  messageId: {
    type: mongoose.Schema.Types.ObjectId,
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

module.exports = mongoose.model('Chats', ChatsSchema);
