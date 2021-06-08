/* eslint-disable no-shadow */
/* eslint-disable func-names */
/* eslint-disable consistent-return */
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const { Schema } = mongoose;

const bcrypt = require('bcrypt');

const UserSchema = new Schema({
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  subscription: {
    type: String,
    enum: ['basic', 'medium', 'advanced'],
  },
  verificationToken: {
    type: String,
  },
  resetPasswordToken: {
    type: String,
  },
  socialUID: {
    type: String,
  },
  socialProvider: {
    type: String,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verifiedAt: {
    type: Date,
    default: '',
  },
  profile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile',
  },
  event: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Products',
  }],
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  updatedAt: {
    type: Date,
    default: Date.now(),
  },
});

UserSchema.pre('save', function (next) {
  // get access to the user model
  const user = this;
  if (this.isModified('password') || this.isNew) {
    // generate a salt then run callback
    bcrypt.genSalt(10, (err, salt) => {
      if (err) {
        return next(err);
      }
      // hash our password using the salt
      bcrypt.hash(user.password, salt, (err, hash) => {
        if (err) {
          return next(err);
        }
        // overwrite plain text password with encrypted password
        user.password = hash;
        next();
      });
    });
  } else {
    return next();
  }
});

UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.verificationToken;
  return obj;
};

UserSchema.methods.comparePassword = function (passw, cb) {
  bcrypt.compare(passw, this.password, (err, isMatch) => {
    if (err) {
      return cb(err);
    }
    cb(null, isMatch);
  });
};

UserSchema.plugin(uniqueValidator);
UserSchema.plugin(require('mongoose-autopopulate'));

module.exports = mongoose.model('User', UserSchema);
