const express = require('express');

const router = express.Router();
const passport = require('passport');

const requireAuth = passport.authenticate('jwt', { session: false });

const { isAuthenticated } = require('../utils/isAuthenticated');

const { generateRoutes } = require('../utils/generateRoutes');
const {
  createRecommendation, getAllRecommendations,
} = require('../controllers/recommendationsController');

const RecommendationsRoutes = [
  {
    method: 'post',
    route: '/create-recommendation',
    middleware: [requireAuth, isAuthenticated],
    action: createRecommendation,
  },
  {
    method: 'get',
    route: '/recommendations',
    middleware: [requireAuth, isAuthenticated],
    action: getAllRecommendations,
  },
];

generateRoutes(router, RecommendationsRoutes);

module.exports = router;
