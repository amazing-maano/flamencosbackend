/* eslint-disable no-shadow */
/* eslint-disable no-param-reassign */
/* eslint-disable consistent-return */
/* eslint-disable no-underscore-dangle */
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const generator = require('generate-password');

const User = require('../models/userModel');
const Notification = require('../models/notificationsModel');
const Profile = require('../models/profileModel');

const { sendMail } = require('../utils/mail');
const io = require('../utils/notifications');

const {
  firebase_origin, netlify_origin, local_origin, token_secret,
} = require('../config/environment');
const { ERROR_TYPES } = require('../config/errorTypes');

let origin;

const {
  DATA_MISSING,
  EMAIL_ALREADY_USED,
  EMAIL_NOT_VERIFIED,
  ALREADY_A_USER,
  USER_CREATED,
  INCORRECT_PASSWORD,
  USER_NOT_FOUND,
  TRY_AGAIN,
  SIGN_OUT,
} = ERROR_TYPES;

module.exports = {
  social: async (req, res) => {
    try {
      let profile;
      const {
        email, providerId, uid,
      } = req.body;

      const user = await User.findOne({
        email,
      });

      if (user.profile) {
        profile = await Profile.findOne({
          user: user._id,
        })
          .populate('bookedEventsByStudent', '_id productName productImageURL productType -schedule')
          .populate('eventsByHost', '_id productName productImageURL productType currency')
          .select('-bookedSessionsByStudent');
      }

      if (user) {
        const accessToken = jwt.sign(user.toJSON(), token_secret, {
          expiresIn: '1d',
        });
        return res.status(200).send({
          msg: ALREADY_A_USER,
          user,
          profile,
          accessToken: `JWT ${accessToken}`,
        });
      }

      let { password } = req.body;
      password = password || generator.generate({ length: 15, numbers: true });

      const newSocialUser = await new User({
        email,
        password,
        socialProvider: providerId,
        socialUID: uid,
        isVerified: true,
        verifiedAt: Date.now(),
      });

      // save the social user
      await newSocialUser.save();

      const accessToken = jwt.sign(newSocialUser.toJSON(), token_secret, {
        expiresIn: '1d',
      });

      res.status(200).json({
        newSocialUser, accessToken: `JWT ${accessToken}`,
      });
    } catch (error) {
      res.send(error.message);
    }
  },
  signup: async (req, res) => {
    console.log(req.headers);
    const data = req.body;

    if (req.headers.origin === 'http://localhost:3000' || req.headers.host === 'localhost:1717') {
      origin = local_origin;
    }

    if (req.headers.origin === 'https://flamenco.netlify.app') {
      origin = netlify_origin;
    }

    if (req.headers.origin === 'https://flamenco-309419.web.app') {
      origin = firebase_origin;
    }

    if (!data.email || !data.password) {
      res.json({ success: false, msg: DATA_MISSING });
    } else {
      const verificationToken = crypto.randomBytes(32).toString('hex');
      console.log(verificationToken);
      const newUser = new User({
        email: data.email,
        password: data.password,
        verificationToken,
      });
      // save the user
      newUser.save((err) => {
        if (err) {
          return res.json({ success: false, msg: err.message });
        }
        // send mail
        sendMail(data.email, 'Verify Email', `<a href="${origin}verify/${verificationToken}">${origin}${verificationToken}</a>`);
        return res.json({
          success: true,
          msg: USER_CREATED,
          user: { newUser, verificationToken },
        });
      });
    }
  },

  signin: async (req, res) => {
    let profile;
    const {
      email,
      password,
    } = req.body;

    const user = await User.findOne({
      email,
    });

    if (!user) {
      return res.send({
        success: false,
        msg: USER_NOT_FOUND,
      });
    }
    if (user.profile) {
      profile = await Profile.findOne({
        user: user._id,
      })
        .populate('bookedEventsByStudent', '_id productName productImageURL productType -schedule')
        .populate('eventsByHost', '_id productName productImageURL productType currency')
        .select('-bookedSessionsByStudent');
    }

    if (user.isVerified) {
      user.comparePassword(password, (err, isMatch) => {
        if (isMatch && !err) {
          // if user is found and password is right create a token
          const accessToken = jwt.sign(user.toJSON(), token_secret, {
            expiresIn: '1d',
          });

          return res.status(200).json({
            user,
            profile,
            accessToken: `JWT ${accessToken}`,
          });
        }
        return res.send({
          success: false,
          msg: INCORRECT_PASSWORD,
        });
      });
    } else {
      return res.send({
        success: false,
        msg: EMAIL_NOT_VERIFIED,
      });
    }
  },
  verifyEmail: async (req, res) => {
    User.findOne({
      verificationToken: req.params.verificationToken,
    }, async (err, user) => {
      if (!req.params.verificationToken || !user) {
        return res.json({ success: false, msg: USER_NOT_FOUND });
      }
      if (err) {
        return res.json({ success: false, msg: USER_NOT_FOUND });
      }
      // if (!user) res.json({ success: false, msg: USER_NOT_FOUND });
      if (user.isVerified) res.json({ success: false, msg: EMAIL_ALREADY_USED });
      else {
        user.isVerified = true;
        user.updatedAt = Date.now();
        user.verifiedAt = Date.now();

        await user.save((err) => {
          if (err) return res.json({ success: false, msg: TRY_AGAIN });
          // return res.json({ success: true, msg: EMAIL_VERIFIED });
        });

        const accessToken = jwt.sign(user.toJSON(), token_secret, {
          expiresIn: '1d',
        });

        const newNotification = await new Notification({
          user: user._id,
          message: 'Email has been successfully verified.',
          unread: true,
        });

        newNotification.save((err) => {
          if (err) {
            return res.json({ success: false, msg: err });
          }
          io.to(user._id).emit('notification', newNotification);
          return res.status(200).json({
            msg: newNotification,
            user,
            accessToken: `JWT ${accessToken}`,
          });
        });
        return user;
      }
    });
  },

  signout: (req, res) => {
    req.logout();
    res.status(200).json({
      msg: SIGN_OUT,
    });
  },
};
