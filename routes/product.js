const express = require('express');

const router = express.Router();
const passport = require('passport');

const multer = require('multer');

const singleUpload = multer({ dest: 'tmp/public/' }).single('file');

const requireAuth = passport.authenticate('jwt', { session: false });

const { isAuthenticated } = require('../utils/isAuthenticated');

const { isHost } = require('../utils/checkRole');

const { generateRoutes } = require('../utils/generateRoutes');
const {
  createProduct, getProductByProductId, updateProduct, getAllProductsByUser,
  getAllProducts, getProductByUserId, getSessionsByHost, getLoggedInUserProduct, updateVariant,
} = require('../controllers/productsController');

const { searchProductByFilters } = require('../controllers/searchController');

const ProductRoutes = [
  {
    method: 'post',
    route: '/create-product',
    middleware: [requireAuth, isAuthenticated, singleUpload, isHost],
    action: createProduct,
  },
  {
    method: 'get',
    route: '/all-products',
    middleware: [requireAuth, isAuthenticated],
    action: getAllProducts,
  },
  {
    method: 'get',
    route: '/user/products/:productId',
    middleware: [requireAuth, isAuthenticated, isHost],
    action: getLoggedInUserProduct,
  },
  {
    method: 'get',
    route: '/product/user/:userId',
    action: getProductByUserId,
  },
  {
    method: 'get',
    route: '/user/all-products',
    middleware: [requireAuth, isAuthenticated, isHost],
    action: getAllProductsByUser,
  },
  {
    method: 'get',
    route: '/sessions-by-host',
    middleware: [requireAuth, isAuthenticated, isHost],
    action: getSessionsByHost,
  },
  {
    method: 'get',
    route: '/product/:productId',
    action: getProductByProductId,
  },
  {
    method: 'put',
    route: '/update-product/:productId',
    middleware: [requireAuth, isAuthenticated, isHost, singleUpload],
    action: updateProduct,
  },
  {
    method: 'put',
    route: '/update-variant/:variantId',
    middleware: [requireAuth, isAuthenticated, isHost],
    action: updateVariant,
  },
  {
    method: 'get',
    route: '/search-events/',
    action: searchProductByFilters,
  },
];

generateRoutes(router, ProductRoutes);

module.exports = router;
