const mongoose = require('mongoose');

const { Schema } = mongoose;

const RecommendationSchema = new Schema({
  recommendedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  recommendedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  message: {
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

module.exports = mongoose.model('Recommendation', RecommendationSchema);
