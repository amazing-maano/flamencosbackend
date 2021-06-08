const mongoose = require('mongoose');

const { Schema } = mongoose;

const ProfileSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    // required: true,
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
  profileImage: {
    type: String,
  },
  bio: {
    type: String,
  },
  methodology: {
    type: String,
  },
  background: {
    type: String,
  },
  profileLevel: {
    type: String,
  },
  profileBelt: {
    type: String,
  },
  socialLinks: {
    facebook: String,
    twitter: String,
    instagram: String,
  },
  videoLink: {
    type: String,
  },
  userResponseTime: {
    type: String,
  },

  taxonomies: {
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
  billingInfo: {
    type: String,
  },
  dob: {
    type: Date,
  },
  postalAddress: {
    type: String,
  },
  phoneNumber: {
    type: Number,
  },
  languages: [{
    type: String,
    required: true,
  }],

  numtotalSpent: {
    type: Number,
    default: 0,
    index: true,
  },
  numtotalEarnings: {
    type: Number,
    default: 0,
    index: true,
  },
  totalEventsByHost: {
    type: Number,
    default: 0,
    index: true,
  },
  totalStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  totalSessionsByHost: {
    type: Number,
    default: 0,
    index: true,
  },
  totalProductPurchased: {
    type: Number,
    default: 0,
    index: true,
  },
  totalSessionsPurchased: {
    type: Number,
    default: 0,
    index: true,
  },
  counts: {
    type: Number,
    default: 0,
    index: true,
  },
  countUpdatedAt: {
    type: Date,
  },
  productPurchasedAt: {
    type: Date,
  },
  eventsByHost: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Products',
    autopopulate: true,
  }],

  bookedEventsByStudent: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Products',
    autopopulate: true,
  }],
  bookedSessionsByStudent: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BookedSessions',
  }],
  totalOrdersByStudent: {
    type: Number,
    default: 0,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: '',
  },
});

ProfileSchema.plugin(require('mongoose-autopopulate'));

module.exports = mongoose.model('Profile', ProfileSchema, 'profiles');
