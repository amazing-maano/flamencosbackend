/* eslint-disable consistent-return */
const mongoose = require('mongoose');
const Profile = require('../models/profileModel');
const Product = require('../models/productsModel');

module.exports = {

  createReview: async (req, res) => {
    try {
      const isPurchasedProduct = await Profile.findOne({ user: req.userId });
      if (!isPurchasedProduct.bookedEventsByStudent.includes(req.params.productId)) {
        return res.status(403).send('Please buy this event to drop a review!');
      }

      const { stars, comment } = req.body;
      if (stars > 5 || stars <= 0) {
        return res.status(500).send('ratings allowed range 1 to 5');
      }
      const product = await Product.findById(req.params.productId);

      if (product) {
        const review = {
          stars,
          comment,
          // eslint-disable-next-line no-underscore-dangle
          profile: mongoose.Types.ObjectId(isPurchasedProduct._id),
        };

        product.reviews.push(review);
        product.totalReviews = product.reviews.length;
        product.rating = product.reviews.reduce((acc, item) => item.stars + acc, 0)
          / product.reviews.length;

        const data = await product.save();
        return res.status(200).send({
          rating: product.rating,
          totalReviews: product.totalReviews,
          reviews: data.reviews,
        });
      }
      return res.status(404).send('Product not found');
    } catch (err) {
      res.status(500).send(err.message);
    }
  },
  getAllReviews: async (req, res) => {
    try {
      const product = await Product.findById({ _id: req.params.productId })
        .populate({
          path: 'reviews',
          populate: {
            path: 'user',
            model: 'Profile',
            select: '_id user firstName lastName location role profileImage',
          },
        })
        .select(['reviews', 'rating', 'totalReviews', '-schedule', '-variantTypes']);
      if (product) {
        Product.aggregate([
          { $match: { _id: mongoose.Types.ObjectId(req.params.productId) } },
          { $unwind: '$reviews' },
          { $project: { 'reviews.stars': 1, 'reviews.createdAt': 1 } },
          { $group: { _id: '$reviews.stars', count: { $sum: 1 } } },

        ]).then((data) => {
          res.status(200).send({
            reviews: product,
            starsCount: data,
          });
        });
      } else {
        return res.status(404).send('Product not found');
      }
    } catch (err) {
      res.status(500).send(err);
    }
  },
};
