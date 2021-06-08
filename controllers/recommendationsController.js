const Recommendations = require('../models/recommendationsModel');
const { ERROR_TYPES } = require('../config/errorTypes');

const {
  TOKEN_VERIFIED,
} = ERROR_TYPES;

module.exports = {
  createRecommendation: async (req, res) => {
    try {
      const { recommendedTo, message } = req.body;

      console.log(req.body);

      const newRecommendation = new Recommendations({
        recommendedTo,
        recommendedBy: req.userId,
        message,
      });
      newRecommendation.save().then((data) => {
        res.status(200).json({ data });
      });
    } catch (err) {
      res.send(err);
    }
  },
  getAllRecommendations: async (req, res) => {
    try {
      console.log(req.userId);
      await Recommendations.find({ recommendedTo: req.userId })
        .populate({
          path: 'recommendedBy',
          select: '_id email profile',
          populate: {
            path: 'profile',
            model: 'Profile',
            select: '_id firstName lastName role profileImage location.address profileBelt',
          },
        }).then((data) => {
          res.status(200).send({
            msg: TOKEN_VERIFIED,
            data,
          });
        });
    } catch (err) {
      res.send(err.message);
    }
  },
};
