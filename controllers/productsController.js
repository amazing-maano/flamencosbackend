/* eslint-disable no-underscore-dangle */
/* eslint-disable consistent-return */
const fs = require('fs');
const aws = require('aws-sdk');
const randomstring = require('randomstring');
const mongoose = require('mongoose');
const moment = require('moment');

const Product = require('../models/productsModel');
const User = require('../models/userModel');
const Profile = require('../models/profileModel');
const ProductVariants = require('../models/productVariantsModel');
const VariantTypes = require('../models/variantTypesModel');

const {
  access_Key_Id,
  secret_Access_Key,
  region,
  s3_bucket,
} = require('../config/environment');

const {
  ERROR_TYPES,
} = require('../config/errorTypes');

const {
  DATA_MISSING,
  USER_NOT_FOUND,
  TOKEN_VERIFIED,
} = ERROR_TYPES;

module.exports = {
  createProduct: async (req, res) => {
    try {
      const user = await User.findOne({
        _id: req.userId,
      });
      const profile = await Profile.findOne({
        user: req.userId,
      });
      if (!user) {
        return res.status(404).send({
          success: false,
          msg: USER_NOT_FOUND,
        });
      }
      if (!profile) {
        return res.status(404).send({
          success: false,
          msg: 'PROFILE_NOT_FOUND',
        });
      }
      const data = req.body;
      if (!data) {
        res.json({
          success: false,
          msg: DATA_MISSING,
        });
      } else {
        const newAbout = {
          methodology: data.methodology,
          whatWillYouLearn: data.whatWillYouLearn,
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

        const newProduct = await new Product({
          user: req.userId,
          productName: data.productName,
          isIndividual: data.isIndividual,
          productMode: data.productMode,
          isPublished: data.isPublished,
          productLevel: data.productLevel,
          eventTaxonomies: newtaxonomies,
          numberOfSeats: data.numberOfSeats,
          about: newAbout,
          productType: data.productType,
          location: newLocation,
          feeDescription: data.feeDescription,
          firstClassFree: data.firstClassFree,
          languages: data.languages,
          timeSlots: data.timeSlots,
          schedule: data.schedule,
          currency: data.currency,
        });

        if (req.file) {
          const keyValue = `eventImages/${req.userId}-${randomstring.generate(10)}-${req.file.originalname}`;

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

          const eventImage = await s3.upload(params).promise();
          const imageUrl = eventImage.Location;

          newProduct.productImageURL = imageUrl;
        }

        const scheduleItems = data.newSchedule.map((item) => ({
          user: req.userId,
          productId: newProduct._id,
          classType: item.classType,
          startTime: item.startTime,
          endTime: item.endTime,
          startDay: item.startDay,
          endDay: item.endDay,
          productFrequency: item.productFrequency,
          sessionCode: item.sessionCode,
          seatsAvailable: data.numberOfSeats,
        }));

        const items = data.newData.map((item) => ({
          user: req.userId,
          productId: newProduct._id,
          price: item.price,
          frequency: item.frequency,
        }));

        const newSessions = [profile.totalSessionsByHost, scheduleItems.length]
          .map((elem) => parseInt(elem, 10));

        const totalSessionsLength = newSessions.reduce((a, b) => a + b, 0);

        await newProduct.save();
        /*
        User.findByIdAndUpdate({
          _id: req.userId,
        }, {
          $push: {
            event: result,
          },
        }, {
          new: true,
        });
        */
        await Profile.findOneAndUpdate({
          user: req.userId,
        }, {
          $inc: {
            totalEventsByHost: 1,
            counts: 1,
          },
          $set: {
            totalSessionsByHost: totalSessionsLength,
          },
          $push: {
            eventsByHost: newProduct,
            countUpdatedAt: Date.now(),
          },
        }, {
          upsert: true,
          returnNewDocument: true,
        });

        const scheduleResult = await ProductVariants.insertMany(scheduleItems);

        await Product.findOneAndUpdate({
          _id: newProduct._id,
          user: req.userId,
        }, {
          $push: {
            schedule: scheduleResult,
          },
        }, {
          new: true,
        });

        const variantsResult = await VariantTypes.insertMany(items);

        const productResult = await Product.findOneAndUpdate({
          _id: newProduct._id,
          user: req.userId,
        }, {
          $push: {
            variantTypes: variantsResult,
          },
        }, {
          new: true,
        });

        return res.status(200).json({
          productResult,
        });
      }
    } catch (err) {
      res.status(500).send(err.message);
    }
  },

  getAllProducts: async (req, res) => {
    try {
      await Product.find({}).select(['_id', 'productName', 'productType', 'productImageURL', 'isPublished']).then((data) => {
        res.status(200).send({
          product: data,
        });
      });
    } catch (err) {
      res.status(500).send(err.message);
    }
  },
  getLoggedInUserProduct: async (req, res) => {
    try {
      const profile = await Profile.findOne({
        user: req.userId,
      })
        .select(['_id', 'firstName', 'lastName', 'profileImage', 'profileLevel', 'role', 'profileBelt']);
      await Product.findOne({
        _id: req.params.productId,
      })
        .populate('bookedEventSessions', 'bookedSlotId')
        .populate('profile', '_id firstName lastName role profileImage profileLevel profileBelt')
        .populate('schedule')
        .populate('variantTypes')
        .then((data) => {
          if (!data) {
            return res.send('no data found');
          }
          return res.status(200).send({
            product: data,
            profile,
          });
        });
    } catch (err) {
      res.send(err.message);
    }
  },
  getProductByUserId: async (req, res) => {
    try {
      const user = await User.find({
        _id: req.params.userid,
      })
        .select('_id', 'email');
      const profile = await Profile.findOne({
        user: req.params.id,
      })
        .populate('event', '-numberOfStudents -productTotalEarnings');

      return res.status(200).send({
        msg: TOKEN_VERIFIED,
        product: { ...user, ...profile },
      });
    } catch (err) {
      res.send(err.message);
    }
  },

  getAllProductsByUser: async (req, res) => {
    try {
      await Product.find({
        user: req.userId,
      })
        .select(['_id', 'productName', 'productType', 'productImageURL', 'isPublished', 'productTotalEarnings'])
        .then((data) => res.status(200).send({
          msg: TOKEN_VERIFIED,
          product: data,
        }));
    } catch (err) {
      res.status(500).end(err.message);
    }
  },

  getSessionsByHost: async (req, res) => {
    try {
      const ongoingSessions = [];
      const upcomingSessions = [];
      const time = moment.utc();

      ProductVariants.find({
        user: req.userId,
      })
        .populate('productId', '_id productName productType numberOfSeats productImageURL')
        .exec(async (err, userSession) => {
          if (userSession.length === 0) {
            return res.status(200).send({
              msg: TOKEN_VERIFIED,
              ongoingSessions,
              upcomingSessions,
            });
          }

          userSession.forEach((session, index) => {
            if (err) console.log(err);

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

            if (userSession.length === index + 1) {
              return res.status(200).send({
                msg: TOKEN_VERIFIED,
                ongoingSessions,
                upcomingSessions,
              });
            }
          });
        });
    } catch (err) {
      res.status(500).send(err.message);
    }
  },

  getProductByProductId: async (req, res) => {
    try {
      const product = await Product.findOne({
        _id: req.params.productId,
      });
      if (!product) {
        return res.send({
          success: false,
          msg: 'No product found!',
        });
      }
      const data = await Product.findOne({
        _id: req.params.productId,
      })
        .populate('schedule')
        .populate('variantTypes')
        .select(['-numberOfStudents', '-productTotalEarnings']);

      if (data === null) {
        return res.send('No Product found!');
      }

      await Profile.findOneAndUpdate({
        user: product.user._id,
      }, {
        $inc: {
          counts: 1,
        },
        $push: {
          countUpdatedAt: Date.now(),
        },
      }, {
        upsert: true,
        returnNewDocument: true,
      });

      const profile = await Profile.findOne({
        user: data.user,
      })
        .select(['_id', 'firstName', 'lastName', 'profileImage', 'profileLevel', 'role', 'profileBelt']);

      return res.status(200).json({
        data,
        profile,
      });
    } catch (err) {
      res.status(500).send(err.message);
    }
  },

  updateProduct: async (req, res) => {
    try {
      const user = await User.findOne({
        _id: req.userId,
      });
      if (!user) {
        return res.send({
          success: false,
          msg: USER_NOT_FOUND,
        });
      }
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

        const updatedEventImage = await s3.upload(params).promise();
        const imageUrl = updatedEventImage.Location;

        data.productImageURL = imageUrl;
      }

      data.updatedAt = Date.now();
      const result = await Product.findOneAndUpdate({
        _id: req.params.productId,
        user: req.userId,
      }, { $set: data }, { new: true });
      // await ProductVariants.insertMany(scheduleItems);
      // await VariantTypes.insertMany(items))
      return res.status(200).json({
        updatedProduct: result,
      });
    } catch (err) {
      res.status(500).send(err.message);
    }
  },

  updateVariant: async (req, res) => {
    try {
      let updatedProduct;
      const user = await User.findOne({
        _id: req.userId,
      });

      if (!user) {
        return res.send({
          success: false,
          msg: USER_NOT_FOUND,
        });
      }
      const data = req.body;
      if (!data) {
        return res.json({
          success: false,
          msg: DATA_MISSING,
        });
      }

      data.updatedAt = Date.now();

      const items = data.map((item) => ({
        _id: item.id,
        price: item.price,
        frequency: item.frequency,
      }));
      console.log(items);

      const { id } = data;
      console.log(req.body.id, 'id');
      console.log(req.params.variantId, 'id2');
      console.log(mongoose.Types.ObjectId(data.id), 'id3');

      data.forEach((item) => {
        updatedProduct = VariantTypes.findOneAndUpdate(
          { _id: req.params.variantId },
          {
            $set: {
              price: item.price,
              frequency: item.frequency,
            },
          },
          {
            upsert: true,
            returnNewDocument: true,
          },
        )
          .then((result) => res.status(200).send({
            updatedProduct: result,
          }));
      });
    } catch (err) {
      console.log(err);
      res.status(500).send(err.message);
    }
  },

};
