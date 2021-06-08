const express = require('express');

const router = express.Router();
const passport = require('passport');
const multer = require('multer');

const singleUpload = multer({ dest: 'tmp/public/' }).single('file');

const requireAuth = passport.authenticate('jwt', { session: false });

const { generateRoutes } = require('../utils/generateRoutes');

const { isAuthenticated } = require('../utils/isAuthenticated');

const {
  createProfile, getProfile, updateProfile, getAllUserProfiles, getLoggedInUserProfile, dashboard,
} = require('../controllers/profileController');

const profileRoutes = [
  {
    method: 'get',
    route: '/dashboard',
    middleware: [requireAuth, isAuthenticated],
    action: dashboard,
  },
  {
    method: 'post',
    route: '/create-profile',
    middleware: [isAuthenticated, requireAuth, singleUpload],
    action: createProfile,
  },
  {
    method: 'get',
    route: '/profile/:id',
    action: getProfile,
  },
  {
    method: 'get',
    route: '/user/profile',
    middleware: [requireAuth, isAuthenticated],
    action: getLoggedInUserProfile,
  },
  {
    method: 'get',
    route: '/profiles',
    middleware: [requireAuth, isAuthenticated],
    action: getAllUserProfiles,
  },
  {
    method: 'put',
    route: '/update-profile',
    middleware: [isAuthenticated, requireAuth, singleUpload],
    action: updateProfile,
  },
];

generateRoutes(router, profileRoutes);

module.exports = router;
