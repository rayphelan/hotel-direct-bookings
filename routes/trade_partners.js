// Set up variables
const express         = require('express');
const router          = express.Router();
const passport        = require('passport');
const mongoose        = require('mongoose');
const LocalStrategy   = require('passport-local').Strategy;
const async           = require('async');


// Models
const TradePartner    = require('../models/trade_partner');
const County          = require('../models/county');
const Category        = require('../models/category');


// Check if TradePartner is already registered
const checkIfTradePartnerAlreadyRegisered = (req, res, next) => {
  var username = req.body.username;
  TradePartner.getTradePartnerByUsername(username, (err, trade_partner) => {
    if (err) throw (err);
    if (!trade_partner) {
      next();
    }
    else {
      req.flash('error_msg', 'Trade Partner is already registered with ' + username + '.');
      res.redirect('/registertp');
    }
  });
}


// Check if TradePartner logged in
const checkIfTradePartnerLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    req.flash('error_msg', 'You are not logged in');
    res.redirect('/logintp');
  }
}


// Trade Partner Dashboard
router.get('/dashboard', (req, res) => {
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
    res.render('trade-partner-dashboard', {
      counties: results.counties,
      categories: results.categories
    });
  });

});


// Register Trade Partner
router.post('/registertp', checkIfTradePartnerAlreadyRegisered, (req, res) => {
  
  // Form variables
  var name = req.body.name;
  var username = req.body.username;
  var password = req.body.password;
  var password2 = req.body.password;
  var website = req.body.website;

  // validation
  req.checkBody('name', 'Name is required').notEmpty();
  req.checkBody('username', 'Email is required').notEmpty();
  req.checkBody('username', 'Email is not valid').isEmail();
  req.checkBody('password', 'Password is required').notEmpty();
  req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

  if(!website.includes("http://") && !website.includes("https://")) website = 'http://' + website;

  const errors = req.validationErrors();

  if (errors) {

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
      res.render('registertp', {
        counties: results.counties,
        categories: results.categories,
        errors,
        name,
        username,
        website
      })
    });
  } else {
    const newTradePartner = TradePartner({
      name,
      username,
      password,
      website
    });

    TradePartner.createTradePartner(newTradePartner, (err, trade_partner) => {
      if (err) throw (err);      
    });

    req.flash('success_msg', 'Success! You are registered. You can log in now.');
    res.redirect('/logintp');
  }

});


// Passport Local Strategy
passport.use(new LocalStrategy(
  (username, password, done) => {
    TradePartner.getTradePartnerByUsername(username, (err, trade_partner) => {
      if (err) throw (err);
      if (!trade_partner) {
        return done(null, false, { message: 'Username or Password invalid.' });
      }
      TradePartner.comparePassword(password, trade_partner.password, (err, isMatch) => {
        if (err) throw (err);
        if (isMatch) {
          return done(null, trade_partner);
        } else {
          return done(null, false, { message: 'Invalid Password' });
        }
      })
    });
  }
));


// Login Trade Partner
router.post('/logintp',
  passport.authenticate('local', {
    successRedirect: '/trade_partners/dashboard',
    failureRedirect: '/logintp',
    failureFlash: true
  }),
  (req, res) => {
    res.redirect('/');
  });


// Logout
router.get('/logouttp', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You have logged out successfully.');
  res.redirect('/logintp');
})


// Serialize
passport.serializeUser((trade_partner, done) => {
  done(null, trade_partner.id);
});


// Deserialize
passport.deserializeUser((id, done) => {
  TradePartner.getTradePartnerById(id, (err, trade_partner) => {
    done(err, trade_partner);
  });
});



module.exports = router;