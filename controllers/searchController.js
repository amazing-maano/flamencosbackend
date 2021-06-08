const Product = require('../models/productsModel');
const Profile = require('../models/profileModel');

module.exports = {
  searchProductByFilters: async (req, res) => {
    try {
      const query = {};
      const query2 = {};
      const query3 = {};

      if (req.query.type === 'Classes') {
        query.productType = 'Class';
      }

      if (req.query.type === 'Experiences') {
        query.productType = 'Experience';
      }

      if (req.query.keyword) {
        query.productName = { $regex: req.query.keyword, $options: 'i' };
        query2.firstName = { $regex: req.query.keyword, $options: 'i' };
        query3.lastName = { $regex: req.query.keyword, $options: 'i' };
      }

      if (req.query.lng && req.query.lat) {
        const coordinates = [req.query.lng, req.query.lat].map(parseFloat);
        const minDis = req.query.minDistance;
        const maxDis = req.query.maxDistance;
        query.location = {
          $near:
           {
             $geometry: { type: 'Point', coordinates },
             $minDistance: minDis,
             $maxDistance: maxDis,
           },
        };
      }

      if (req.query.rating) {
        query.rating = req.query.rating;
      }

      if (req.query.productLevel) {
        query.productLevel = req.query.productLevel;
      }

      if (req.query.productMode) {
        query.productMode = req.query.productMode;
      }

      if (req.body.minPrice && req.body.maxPrice) {
        query['productVariants.price'] = { $in: [req.body.minPrice, req.body.maxPrice] };
      }

      // Product.find({ 'productVariants.price': { $in: [15, 50] } })
      const newData = {};

      Product.find(query)
        .populate('variantTypes')
        .select('-numberOfStudents -bookedEventSessions -productTotalEarnings -languages -about -reviews')
        // eslint-disable-next-line consistent-return
        .exec(async (err, products) => {
          if (err) {
            return res.status(400).json({
              error: err.message,
            });
          }
          if (Object.keys(query).length === 0) {
            return res.send('Query not found!');
          }
          if (products.length === 0 && newData.length === 0) {
            return res.send('No exact event found!');
          }

          await Profile.find({ $or: [query2, query3] })
            .select('-eventsByHost -bookedEventsByStudent -bookedSessionsByStudent -languages -bio -methodology -background')
            .then((profile) => res.status(200).json({
              productData: products,
              profileData: profile,
            }));
        });
    } catch (err) {
      res.status(404).send(err.message);
    }
  },
};
