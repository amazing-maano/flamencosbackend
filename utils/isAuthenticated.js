const jwt = require('jsonwebtoken');
const { token_secret } = require('../config/environment');

// eslint-disable-next-line consistent-return
exports.isAuthenticated = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) { return res.status(403).send({ auth: false, message: 'No token provided.' }); }

  jwt.verify(token.replace('JWT ', ''), token_secret, (err, verifiedJwt) => {
    if (err) { return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' }); }

    // eslint-disable-next-line no-underscore-dangle
    req.userId = verifiedJwt._id;
    return next();
  });
};
