const mongoose = require('mongoose');

const { Schema } = mongoose;

const SessionSchema = new Schema({
  attendees: [{
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  }],
  productVariantId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  sessionCode: {
    type: String,
  },
  numberOfSeatsLeft: {
    type: Number,
  },
  startTime: {
    type: String,
  },
  endTime: {
    type: String,
  },
  date: {
    type: Date,
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

module.exports = mongoose.model('Session', SessionSchema);
