const mongoose = require('mongoose');

const { Schema } = mongoose;

const OrdersSchema = new Schema({
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Products',
  },
  eventHostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  bookedSessionId: [{
    type: [String],
    required: true,
  }],
  transactionId: {
    type: Number,
  },
  isPaid: {
    type: Boolean,
    required: true,
  },
  amountPaid: {
    type: Number,
    required: true,
  },
  paymentMethod: {
    type: String,
    require: true,
  },
  cardNumber: {
    type: Number,
    require: true,
  },
  cardExpiryMonth: {
    type: Number,
    require: true,
  },
  cardExpiryYear: {
    type: Number,
    require: true,
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

module.exports = mongoose.model('Orders', OrdersSchema);
