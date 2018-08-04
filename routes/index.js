// Set up variables
const express   = require('express');
const router    = express.Router();
const async     = require('async');

// Models
var Hotel     = require('../models/hotel');
var County    = require('../models/county');
var Category  = require('../models/category');


//  Home Page
router.get('/', (req, res)=>{
  // Perform operations in parallel using Async
  async.parallel({
    hotels: callback => {
      Hotel.find({})
      .populate('category county')      
      .limit(10)
      .exec(callback);
    },
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
    res.render('index', {
      counties: results.counties,
      categories: results.categories,
      hotels: results.hotels
    });
  });
});


//  Login Page
router.get('/login', (req, res)=>{
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
    res.render('login', {
      counties: results.counties,
      categories: results.categories
    });
  });
});

//  Registration Page
router.get('/register', (req, res) => {
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
    res.render('register', { 
      counties: results.counties, 
      categories: results.categories      
    });
  });

});


// Export
module.exports = router;