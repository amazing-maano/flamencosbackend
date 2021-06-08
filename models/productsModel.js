const mongoose = require('mongoose');

const { Schema } = mongoose;

const reviewSchema = new Schema({
  stars: { type: Number, required: true },
  comment: { type: String, required: true },
  profile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile',
    // autopopulate: true,
  },
  createdAt: {
    type: String,
    default: Date.now,
  },
  updatedAt: {
    type: String,
    default: '',
  },
});

const ProductsSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  userProfile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile',
  },
  productName: {
    type: String,
    required: true,
  },
  productType: {
    type: String,
    required: true,
  },
  isIndividual: {
    type: Boolean,
    required: true,
  },
  productMode: {
    type: String,
    required: true,
    enum: ['Online', 'Offline', 'Both'],
  },
  numberOfSeats: {
    type: String,
    required: true,
  },
  isPublished: {
    type: Boolean,
    required: true,
  },
  productLevel: {
    type: String,
    required: true,
  },
  productImageURL: {
    type: String,
  },
  about: {
    methodology: String,
    whatWillYouLearn: String,
  },
  eventTaxonomies: {
    profession: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ClassTaxonomies',
    },
    subjects: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ClassTaxonomies',
    }],
    topics: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ClassTaxonomies',
    }],
  },
  languages: [{
    type: String,
    required: true,
  }],

  views: {
    type: Number,
  },

  productTotalEarnings: {
    type: Number,
    default: 0,
    index: true,
  },

  reviews: [reviewSchema],
  rating: {
    type: Number,
    required: true,
    default: 0,
  },
  totalReviews: {
    type: Number,
    required: true,
    default: 0,
  },
  totalStars: {
    oneStar: Number,
    twoStar: Number,
    threeStar: Number,
    fourStar: Number,
    fiveStar: Number,
  },

  location: {
    type: {
      type: String,
      default: 'Point',
    },

    coordinates: [{
      type: Number,
      required: 'You must supply coordinates',
    }],

    address: {
      type: String,
      // required: 'You must supply an address!',
    },
  },

  feeDescription: {
    type: String,
    required: true,
  },
  firstClassFree: {
    type: Boolean,
    required: true,
    default: false,
  },

  timeSlots: [String],
  currency: {
    type: String,
  },

  profile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile',
    autopopulate: true,
  },
  schedule: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductVariants',
    autopopulate: true,
  }],
  variantTypes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VariantTypes',
    autopopulate: true,
  }],

  numberOfStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  bookedEventSessions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BookedSessions',
  }],

  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: '',
  },
});

ProductsSchema.index({
  location: '2dsphere',
});

ProductsSchema.plugin(require('mongoose-autopopulate'));

module.exports = mongoose.model('Products', ProductsSchema, 'products');
