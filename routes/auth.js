const express = require('express');

const router = express.Router();
const passport = require('passport');

const requireAuth = passport.authenticate('jwt', { session: false });

const { generateRoutes } = require('../utils/generateRoutes');

const { isAuthenticated } = require('../utils/isAuthenticated');

const {
  social, signup, signin, signout, verifyEmail,
} = require('../controllers/authController');

const authRoutes = [
  {
    method: 'post',
    route: '/social',
    action: social,
  },
  {
    method: 'post',
    route: '/signup',
    action: signup,
  },
  {
    method: 'post',
    route: '/signin',
    action: signin,
  },
  {
    method: 'get',
    route: '/signout',
    middleware: [requireAuth, isAuthenticated],
    action: signout,
  },
  {
    method: 'get',
    route: '/verify/:verificationToken',
    action: verifyEmail,
  },
];

generateRoutes(router, authRoutes);

module.exports = router;
