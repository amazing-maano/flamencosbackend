const express = require('express');

const router = express.Router();

const { generateRoutes } = require('../utils/generateRoutes');
const {
  createTaxonomy, getAllProfessions, getAllTaxonomies,
  getAllSubjectsByProfession, getAllTopicsBySubjects,
} = require('../controllers/taxonomiesController');

const TaxonomiesRoutes = [
  {
    method: 'post',
    route: '/create-taxonomy',
    action: createTaxonomy,
  },
  {
    method: 'get',
    route: '/taxonomies',
    action: getAllTaxonomies,
  },
  {
    method: 'get',
    route: '/professions',
    action: getAllProfessions,
  },
  {
    method: 'get',
    route: '/subjects',
    action: getAllSubjectsByProfession,
  },
  {
    method: 'get',
    route: '/topics',
    action: getAllTopicsBySubjects,
  },
];

generateRoutes(router, TaxonomiesRoutes);

module.exports = router;
