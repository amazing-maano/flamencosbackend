const ClassTaxonomies = require('../models/classTaxonomiesModel');
const { ERROR_TYPES } = require('../config/errorTypes');

const {
  TOKEN_VERIFIED,
} = ERROR_TYPES;

module.exports = {
  createTaxonomy: async (req, res) => {
    try {
      const data = req.body;

      const newTaxonomy = new ClassTaxonomies(data);

      newTaxonomy.save().then((result) => res.status(200).json({ result }))
        .catch((err) => {
          res.status(500).json({
            error: err.message,
          });
        });
      console.log(newTaxonomy);
    } catch (err) {
      res.status(500).send(err.message);
    }
  },
  getAllTaxonomies: async (req, res) => {
    try {
      ClassTaxonomies.find({ }).then((data) => res.status(200).send({
        msg: TOKEN_VERIFIED,
        data,
      }))
        .catch((err) => {
          res.status(500).json({
            error: err.message,
          });
        });
    } catch (err) {
      res.status(500).send(err.message);
    }
  },
  getAllProfessions: async (req, res) => {
    try {
      ClassTaxonomies.find({ }).select('profession').then((data) => res.status(200).send({
        msg: TOKEN_VERIFIED,
        data,
      }))
        .catch((err) => {
          res.status(500).json({
            error: err.message,
          });
        });
    } catch (err) {
      res.status(500).send(err.message);
    }
  },
  getAllSubjectsByProfession: async (req, res) => {
    try {
      ClassTaxonomies.find({ profession: req.body.profession }).select('subject').then((data) => res.status(200).send({
        msg: TOKEN_VERIFIED,
        data,
      }))
        .catch((err) => {
          res.status(500).json({
            error: err.message,
          });
        });
    } catch (err) {
      res.status(500).send(err.message);
    }
  },
  getAllTopicsBySubjects: async (req, res) => {
    try {
      ClassTaxonomies.find().select(['topics', 'tags', 'subject']).then((data) => res.status(200).send({
        msg: TOKEN_VERIFIED,
        data,
      }))
        .catch((err) => {
          res.status(500).json({
            error: err.message,
          });
        });
    } catch (err) {
      res.status(500).send(err.message);
    }
  },
};
