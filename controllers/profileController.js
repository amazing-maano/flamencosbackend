/* eslint-disable consistent-return */
const fs = require('fs');
const aws = require('aws-sdk');
const randomstring = require('randomstring');
const moment = require('moment');

const Profile = require('../models/profileModel');
const Recommendations = require('../models/recommendationsModel');
const BookedSessions = require('../models/bookedSessionsModel');
const ProductVariants = require('../models/productVariantsModel');
const User = require('../models/userModel');

const {
  access_Key_Id, secret_Access_Key, region, s3_bucket,
} = require('../config/environment');

const {
  ERROR_TYPES,
} = require('../config/errorTypes');

const {
  DATA_MISSING,
} = ERROR_TYPES;

module.exports = {
  createProfile: async (req, res) => {
    try {
      const user = await User.findOne({ _id: req.userId });
      if (!user) {
        return res.send({
          success: false,
          msg: 'USER_NOT_FOUND',
        });
      }
      if (user.profile) {
        return res.send({
          success: false,
          msg: 'profile already exists',
        });
      }
      const data = req.body;
      if (!data) {
        return res.json({
          success: false,
          msg: DATA_MISSING,
        });
      }

      const newSocialLinks = {
        facebook: data.facebook,
        twitter: data.twitter,
        instagram: data.instagram,
      };

      const newtaxonomies = {
        profession: data.profession,
        subjects: data.subjects,
        topics: data.topics,
      };

      const newLocation = {
        coordinates: data.locationDetails,
        address: data.address,
      };

      const newProfile = new Profile({
        user: req.userId,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        userLocation: data.userLocation,
        bio: data.bio,
        methodology: data.methodology,
        background: data.background,
        profileLevel: data.profileLevel,
        profileBelt: data.profileBelt,
        videoLink: data.videoLink,
        dob: data.dob,
        postalAddress: data.postalAddress,
        phoneNumber: data.phoneNumber,
        languages: data.languages,
        socialLinks: newSocialLinks,
        taxonomies: newtaxonomies,
        location: newLocation,
      });

      if (req.file) {
        const keyValue = `profileImages/${req.userId}-${randomstring.generate(10)}-${req.file.originalname}`;

        aws.config.setPromisesDependency();
        aws.config.update({
          accessKeyId: access_Key_Id,
          secretAccessKey: secret_Access_Key,
          region,
        });
        const s3 = new aws.S3();

        const params = {
          Bucket: s3_bucket,
          Body: fs.createReadStream(req.file.path),
          Key: keyValue,
        };
        const profileImage = await s3.upload(params).promise();
        const imageUrl = profileImage.Location;

        newProfile.profileImage = imageUrl;
      }

      const profileData = await newProfile.save();

      const result = await User.findByIdAndUpdate({ _id: req.userId },
        { $push: { profile: profileData } }, { new: true });

      return res.status(200).json({
        result,
        newProfile,
      });
    } catch (err) {
      return res.status(500).send(err.message);
    }
  },
  getAllUserProfiles: async (req, res) => {
    try {
      const data = await Profile.find({}).select(['_id', 'userName', 'role',
        'profileImage', 'userLocation', 'profileLevel', 'taxonomies',
      ]);

      if (data === null) {
        return res.send('No profile found!');
      }
      return res.status(200).json({
        data,
      });
    } catch (err) {
      return res.status(500).send(err.message);
    }
  },
  getLoggedInUserProfile: async (req, res) => {
    try {
      const recommendationsData = await Recommendations.find({ recommendedTo: req.userId })
        .populate({
          path: 'recommendedBy',
          select: '_id email profile',
          populate: {
            path: 'profile',
            model: 'Profile',
            select: '_id firstName lastName role profileImage location.address profileBelt',
          },
        });
      const data = await Profile.findOne({
        user: req.userId,
      })
        .populate('bookedEventsByStudent', '_id productName productImageURL productType -schedule')
        .populate('eventsByHost', '_id productName productImageURL productType currency')
        .select('-bookedSessionsByStudent');

      if (!data) {
        return res.send('no data found');
      }
      return res.status(200).send({
        user: data,
        recommendations: recommendationsData,
      });
    } catch (err) {
      return res.send(err.message);
    }
  },
  dashboard: async (req, res) => {
    try {
      const ongoingSessions = [];
      const upcomingSessions = [];
      let userSessions;
      const time = moment.utc();
      const profile = await Profile.findOne({ user: req.userId });

      if (!profile) {
        return res.status(500).send('no profile found for this user');
      }

      await User.findOne({
        _id: req.userId,
      })
        .select(['email', 'isVerified', '_id'])
        .populate('profile', '-bio -background -methodology -eventsByHost -taxonomies -languages -bookedEventsByStudent -bookedSessionsByStudent')
        .exec(async (err, user_data) => {
          if (err) console.log(err);

          if (!user_data) {
            return res.send('user not found');
          }

          if (profile.role === 'host') {
            userSessions = await ProductVariants.find({
              user: req.userId,
            }).populate('productId', '_id productName productType numberOfSeats productImageURL');
          } else {
            userSessions = await BookedSessions.find({ attendee: req.userId })
              .populate('productId', 'productName productImageURL numberOfSeats currency -schedule')
              .populate('bookedVariantType', 'price');
          }

          if (userSessions.length === 0) {
            return res.status(200).send({
              user: user_data,
              ongoingSessions,
              upcomingSessions,
            });
          }

          userSessions.forEach((session, index) => {
            const startTime = moment.utc(session.startTime);
            const endTime = moment.utc(session.endTime);

            if (time.isSame(startTime)
              || time.isSame(endTime)
              || time.isBetween(startTime, endTime)
            ) {
              ongoingSessions.push(session);
            } else if (time.isBefore(startTime)) {
              upcomingSessions.push(session);
            }

            if (userSessions.length === index + 1) {
              return res.status(200).send({
                user: user_data,
                ongoingSessions,
                upcomingSessions,
              });
            }
          });
        });
    } catch (err) {
      return res.status(500).send(err.message);
    }
  },

  getProfile: async (req, res) => {
    try {
      const recommendations = await Recommendations.find({ recommendedTo: req.params.id })
        .populate({
          path: 'recommendedBy',
          select: '_id email profile',
          populate: {
            path: 'profile',
            model: 'Profile',
            select: '_id firstName lastName role profileImage location.address profileBelt',
          },
        });
      const data = await Profile.findOne({
        _id: req.params.id,
      })
        .populate('eventsByHost', 'productName productType productMode totalEarnings productImageURL rating');
      if (data === null) {
        return res.send('No profile found!');
      }
      return res.json({
        user: data,
        recommendations,
      });
    } catch (err) {
      return res.send(err.message);
    }
  },

  updateProfile: async (req, res) => {
    try {
      const data = req.body;
      if (!data) {
        return res.json({
          success: false,
          msg: DATA_MISSING,
        });
      }

      if (req.file) {
        const keyValue = `profileImages/${req.userId}-${randomstring.generate(10)}-${req.file.originalname}`;

        aws.config.setPromisesDependency();
        aws.config.update({
          accessKeyId: access_Key_Id,
          secretAccessKey: secret_Access_Key,
          region,
        });
        const s3 = new aws.S3();

        const params = {
          Bucket: s3_bucket,
          Body: fs.createReadStream(req.file.path),
          Key: keyValue,
        };

        const profileImage = await s3.upload(params).promise();
        const imageUrl = profileImage.Location;

        data.profileImage = imageUrl;
      }

      data.updatedAt = Date.now();

      const result = await Profile.findOneAndUpdate({ user: req.userId },
        { $set: data }, { new: true });
      return res.status(200).json({ updatedProfile: result });
    } catch (err) {
      return res.status(500).send(err.message);
    }
  },
};
