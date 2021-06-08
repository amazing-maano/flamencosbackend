const mongoose = require('mongoose');

const { Schema } = mongoose;

const VariantTypesSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Products',
    // required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  numberOfClass: {
    type: Number,
  },
  frequency: {
    type: String,
  },
  createdAt: {
    type: String,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: '',
  },
});
VariantTypesSchema.set('toObject', { virtuals: true });
VariantTypesSchema.set('toJSON', { virtuals: true });
module.exports = mongoose.model('VariantTypes', VariantTypesSchema);
