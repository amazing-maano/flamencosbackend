const Profile = require('../models/profileModel');

module.exports = {
  isAdmin: async (req, res, next) => {
    const user = await Profile.find({ user: req.userId });
    if (!user) {
      return res.status(403).send({ auth: false, message: 'User not found' });
    }
    if (user.role !== 'admin') {
      return res.status(403).send({ auth: false, message: 'not an admin' });
    }
    return next();
  },
  isHost: async (req, res, next) => {
    const user = await Profile.findOne({ user: req.userId });
    if (!user) {
      return res.status(403).send({ auth: false, message: 'User not found' });
    }
    if (user.role !== 'host') {
      return res.status(403).send({ auth: false, message: 'not an admin' });
    }
    return next();
  },
};
