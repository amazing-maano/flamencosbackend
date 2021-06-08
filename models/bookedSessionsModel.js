const mongoose = require('mongoose');

const { Schema } = mongoose;

const BookedSessionsSchema = new Schema({
  attendee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Products',
  },
  sessionCode: {
    type: String,
    required: true,
  },
  startTime: Date,
  endTime: Date,

  bookedSlotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductVariants',
  },
  bookedVariantType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VariantTypes',
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

BookedSessionsSchema.plugin(require('mongoose-autopopulate'));

module.exports = mongoose.model('BookedSessions', BookedSessionsSchema);
