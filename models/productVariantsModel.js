const mongoose = require('mongoose');

const { Schema } = mongoose;

const ProductVariantsSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Products',
    // autopopulate: true,
  },
  sessionCode: String,
  classType: String,
  startTime: Date,
  endTime: Date,
  startDay: String,
  endDay: String,
  productFrequency: String,
  seatsAvailable: Number,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: '',
  },
});

ProductVariantsSchema.plugin(require('mongoose-autopopulate'));

ProductVariantsSchema.set('toObject', { virtuals: true });
ProductVariantsSchema.set('toJSON', { virtuals: true });
module.exports = mongoose.model('ProductVariants', ProductVariantsSchema);
