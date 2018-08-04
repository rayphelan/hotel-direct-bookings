// Index Routes
const express = require('express');
const router = express.Router();

var async = require('async');

var Hotel = require('../models/hotel');
var County = require('../models/county');
var Category = require('../models/category');



//  Counties Page
router.get('/', (req, res)=>{
  // Perform operations in parallel using Async
  async.parallel({   
    counties: callback => {
      County.find({}).exec(callback);
    },
    categories: callback => {
      Category.find({}).exec(callback);
    }
  }, (err, results) => {
    if (err) {
      res.status(500).json({ error: err });
    }        
    res.render('counties', {
      counties: results.counties,
      categories: results.categories
    });
  });
});


// Export
module.exports = router;