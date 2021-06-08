const User = require('../models/userModel');
const Profile = require('../models/profileModel');
const Product = require('../models/productsModel');
const ProductVariants = require('../models/productVariantsModel');
const Orders = require('../models/ordersModel');
const BookedSessions = require('../models/bookedSessionsModel');

const {
  ERROR_TYPES,
} = require('../config/errorTypes');

const {
  DATA_MISSING,
  USER_NOT_FOUND,
  TOKEN_VERIFIED,
} = ERROR_TYPES;

module.exports = {
  // eslint-disable-next-line consistent-return
  bookProduct: async (req, res) => {
    try {
      const user = await User.findOne({ _id: req.userId });

      const product = await Product.findOne({ _id: req.params.productId });

      if (!user) {
        return res.send({
          success: false,
          msg: USER_NOT_FOUND,
        });
      }
      if (!product) {
        return res.send({
          success: false,
          msg: 'Product not found!',
        });
      }
      const data = req.body;
      if (!req.body) {
        return res.status(400).json({
          msg: DATA_MISSING,
        });
      }
      const bookedSlots = data.bookSessions.map((item) => ({
        attendee: req.userId,
        productId: req.params.productId,
        startTime: data.startTime,
        endTime: data.endTime,
        bookedVariantType: item.bookedVariantType,
        bookedSlotId: item.bookedSlotId,
        sessionCode: item.sessionCode,
      }));

      const bookedSessionsArray = await BookedSessions.insertMany(bookedSlots);

      const newOrder = new Orders({
        buyerId: req.userId,
        transactionId: data.transactionId,
        isPaid: data.isPaid,
        amountPaid: data.amountPaid,
        paymentMethod: data.paymentMethod,
        cardNumber: data.cardNumber,
        cardExpiryMonth: data.cardExpiryMonth,
        cardExpiryYear: data.cardExpiryYear,
      });

      // eslint-disable-next-line no-underscore-dangle
      const productUser = product.user._id;

      const profile = await Profile.findOne({ user: req.userId });
      const total1 = [profile.numtotalSpent, data.amountPaid].map((elem) => parseInt(elem, 10));
      const newTotalSpent = total1.reduce((a, b) => a + b, 0);

      const profile2 = await Profile.findOne({ user: productUser });
      const total2 = [profile2.numtotalEarnings, data.amountPaid]
        .map((elem) => parseInt(elem, 10));
      const newTotalEarnings = total2.reduce((a, b) => a + b, 0);

      const total3 = [product.productTotalEarnings, data.amountPaid]
        .map((elem) => parseInt(elem, 10));

      const newTotalProductEarnings = total3.reduce((a, b) => a + b, 0);

      const sessionsBooked = [profile.totalSessionsPurchased, bookedSlots.length]
        .map((elem) => parseInt(elem, 10));

      const totalSessionsBookedLength = sessionsBooked.reduce((a, b) => a + b, 0);

      const scheduleids = data.scheduleId;

      newOrder.bookedSessionId = scheduleids;

      await newOrder.save();

      await ProductVariants.findOneAndUpdate({
        _id: { $in: data.scheduleId },
        seatsAvailable: { $gt: 0 },
      }, { $inc: { seatsAvailable: -1 } }, {
        multi: true,
      });

      await Profile.findOneAndUpdate({
        user: req.userId,
      }, {
        $set: { numtotalSpent: newTotalSpent },
        $inc: { totalOrdersByStudent: 1 },
        $push: {
          bookedEventsByStudent: req.params.productId,
          bookedSessionsByStudent: bookedSessionsArray,
        },

      }, { upsert: true, returnNewDocument: true });

      await Profile.findOneAndUpdate({
        user: productUser,
      }, {
        $inc: { totalProductPurchased: 1, totalSessionsPurchased: totalSessionsBookedLength },
        $push: {
          productPurchasedAt: Date.now(),
        },
        $set: {
          numtotalEarnings: newTotalEarnings,
          totalStudents: req.userId,
        },

      }, { upsert: true, returnNewDocument: true });

      await Product.findOneAndUpdate({
        _id: req.params.productId,
      }, {
        $set: {
          productTotalEarnings: newTotalProductEarnings,
          numberOfStudents: req.userId,
        },
        $push: {
          totalEarnings: data.amountPaid,
          bookedEventSessions: bookedSessionsArray,

        },
      },
      { upsert: true, returnNewDocument: true });

      return res.status(200).json({
        bookedSessionsArray,
      });
    } catch (err) {
      res.status(500).send(err.message);
    }
  },
  getBookedSessionsByUserId: async (req, res) => {
    try {
      const start = new Date();
      start.setHours(0, 0, 0, 0);

      const end = new Date();
      end.setHours(23, 59, 59, 999);

      const studentOngoingSessions = await BookedSessions.find({
        attendee: req.userId,
        endTime: { $gte: start, $lt: end },
      })
        .populate('productId', '_id productName productType numberOfSeats productImageURL');

      const studentUpcomingSessions = await BookedSessions.find({
        attendee: req.userId,
        endTime: { $gt: end },
      })
        .populate('productId', '_id productName productType numberOfSeats productImageURL');

      return res.status(200).send({
        msg: TOKEN_VERIFIED,
        studentOngoingSessions,
        studentUpcomingSessions,
      });
    } catch (err) {
      return res.status(500).send(err.message);
    }
  },
  getPaymentDetailsByUser: async (req, res) => {
    try {
      const data = await Orders.find({
        buyerId: req.userId,
      }).select(['isPaid', 'amountPaid', 'paymentMethod', 'cardNumber', 'cardExpiryMonth', 'cardExpiryYear'])
        .sort({ createdAt: -1 })
        .limit(1);
      return res.status(200).send({
        msg: TOKEN_VERIFIED,
        paymentDetails: data,
      });
    } catch (err) {
      return res.status(500).send(err.message);
    }
  },
};
