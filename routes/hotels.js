var express = require('express');
var router = express.Router();
var passport = require('passport');
var mongoose = require('mongoose');
var LocalStrategy = require('passport-local').Strategy;
var async = require('async');

// Models
var Hotel = require('../models/hotel');
var Room = require('../models/room');
var County = require('../models/county');
var Category = require('../models/category');

// Hotel Dashboard
router.get('/dashboard', checkIfLoggedIn, function(req, res) {
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
    res.render('hotel-dashboard', {
      counties: results.counties,
      categories: results.categories
    });
  });

});



// Edit Hotel Profile
router.get('/profile/edit', checkIfLoggedIn, function (req, res) {
  // Perform operations in parallel using Async
  async.parallel({
    hotel: callback => {
      Hotel.findById(req.user._id)
        .populate('category county')
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
    res.render('hotel-profile-edit', {
      hotel: results.hotel,
      counties: results.counties,
      categories: results.categories
    });
  });
});


// Hotel Profile
router.get('/profile/:id', function (req, res) {
  // Perform operations in parallel using Async
  async.parallel({
    hotel: callback => {
      Hotel.findById(req.params.id)
      .populate('category county')
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
    res.render('hotel-profile', {
      hotel: results.hotel,
      counties: results.counties,
      categories: results.categories
    });
  });
});




// Hotel Room New Page (Ajax)
router.get('/rooms/new', checkIfLoggedIn, function(req, res) {
  res.render('hotel-room-new', {layout:false});
});

// Hotel Edit Room Page (Ajax)
router.get('/rooms/edit/:id', checkIfLoggedIn, (req, res) => {    
  Room.
    find({ '_id': req.params.id }).
    exec(function (error, room) {
      if(error) {
        res.status(500).json({ error: error });
      }
      else {      
        res.render('hotel-room-edit', { 
          layout: false, 
          room: room 
        });
      }
  });
});

// Hotel Delete Room Page (Ajax)
router.get('/rooms/delete/:id', checkIfLoggedIn, (req, res) => {
  Room.
    find({ '_id': req.params.id }).
    exec(function (error, room) {
      if (error) {
        res.status(500).json({ error: error });
      }
      else {        
        res.render('hotel-room-delete', { layout: false, room: room });
      }
    });
});

// Hotel Room New POST
router.post('/rooms/new', checkIfLoggedIn, (req, res) => {
  var roomName = req.body.roomName;
  var roomPrice = req.body.roomPrice;

  // validation
  req.checkBody('roomName', 'Room Name is required.').notEmpty();
  req.checkBody('roomPrice', 'Room Price is required.').notEmpty();
  
  var errors = req.validationErrors();

  if (errors) {
    //req.flash('custom_errors', errors);
    //res.redirect('/hotels/dashboard');
    return res.status(400).json({ errors: errors });
  } 
  else {
    // Room Instance
    room = new Room({
      _id: new mongoose.Types.ObjectId(),
      roomName: roomName,
      hotel: req.user.id,
      roomPrice: roomPrice
    });

    // Save Room
    room.save((err, room) => {
      if (err) {
        req.flash('custom_errors', err);
        res.redirect('/hotels/dashboard');
      }    
      Room.find({'hotel':req.user._id})
        .sort({ '_id': -1 })
        .exec((err, rooms) => {
          if (err) {
            req.flash('custom_errors', err);
            res.redirect('/hotels/dashboard');
          }          
          res.render('hotel-room-list', { layout: false, rooms: rooms });
      })
      
    });
  }
  
});


// Update room
router.put('/rooms/:id', checkIfLoggedIn, (req, res) => {

  var roomName = req.body.roomName;
  var roomPrice = req.body.roomPrice;

  // validation
  req.checkBody('roomName', 'Room Name is required.').notEmpty();
  req.checkBody('roomPrice', 'Room Price is required.').notEmpty();

  var errors = req.validationErrors();

  if (errors) {
    //req.flash('custom_errors', errors);
    //res.redirect('/hotels/dashboard');
    return res.status(400).json({ errors: errors });
  }
  else {

    // Room Instance
    room = new Room({
      roomName: roomName,      
      roomPrice: roomPrice      
    });

    // Update Room
    Room.findByIdAndUpdate(req.params.id, room, {}, function (err, room) {
      if (err) {
        return res.status(500).json({ "error": err });
      }
      Room.find({ 'hotel': req.user._id })
        .sort({ '_id': -1 })
        .exec((err, rooms) => {
          if (err) {
            req.flash('custom_errors', err);
            res.redirect('/hotels/dashboard');
          }
          res.render('hotel-room-list', { layout: false, rooms: rooms });
        })
    });
  }
});


//  Delete Room
router.delete('/rooms/:id', checkIfLoggedIn, (req, res, next) => {
  Room.deleteOne({ 
    "_id": req.params.id,
    "hotel": req.user._id
  }, function (err) {
    if (err) {
      return res.status(401).json({ "error": err });
    }
    res.send(req.params.id);
  });
});


// Register
router.post('/register', checkIfAlreadyRegisered, function (req, res) {
  var name = req.body.name;
  var username = req.body.username;
  var password = req.body.password;
  var password2 = req.body.password;
  var county = req.body.county;
  var locationName = req.body.locationName;
  var category = req.body.category;
  var stars = req.body.stars;
  var website = req.body.website;

  // validation
  req.checkBody('name', 'Name is required').notEmpty();
  req.checkBody('username', 'Email is required').notEmpty();
  req.checkBody('username', 'Email is not valid').isEmail();
  req.checkBody('password', 'Password is required').notEmpty();
  req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

  if(!website.includes("http://") && !website.includes("https://")) website = 'http://' + website;

  var errors = req.validationErrors();

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
      res.render('register', {
        counties: results.counties,
        categories: results.categories,
        errors,
        name,
        username,
        county,
        locationName,
        category,
        stars,
        website
      })
    });
  } else {
    var newHotel = Hotel({
      name,
      username,
      password,
      county,
      locationName,
      category,
      stars,
      website
    });

    Hotel.createHotel(newHotel, function (err, hotel) {
      if (err) throw (err);      
    });

    req.flash('success_msg', 'Success! You are registered. You can log in now.');
    res.redirect('/login');
  }

});


// Check if hotel is already registered
function checkIfAlreadyRegisered(req, res, next) {
  var username = req.body.username;
  Hotel.getHotelByUsername(username, function (err, hotel) {
    if (err) throw (err);
    if (!hotel) {
      next();
    }
    else {
      req.flash('error_msg', 'Hotel is already registered with ' + username + '.');
      res.redirect('/register');
    }
  });
}


// Check if logged in
function checkIfLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    req.flash('error_msg', 'You are not logged in');
    res.redirect('/login');
  }
}


// Passport Local Strategy
passport.use(new LocalStrategy(
  function (username, password, done) {
    Hotel.getHotelByUsername(username, function (err, hotel) {
      if (err) throw (err);
      if (!hotel) {
        return done(null, false, { message: 'Username or Password invalid.' });
      }
      Hotel.comparePassword(password, hotel.password, function (err, isMatch) {
        if (err) throw (err);
        if (isMatch) {
          return done(null, hotel);
        } else {
          return done(null, false, { message: 'Invalid Password' });
        }
      })
    });
  }
));


// Login
router.post('/login',
  passport.authenticate('local', {
    successRedirect: '/hotels/dashboard',
    failureRedirect: '/login',
    failureFlash: true
  }),
  function (req, res) {
    res.redirect('/');
  });

// Logout
router.get('/logout', function (req, res) {
  req.logout();
  req.flash('success_msg', 'You have logged out successfully.');
  res.redirect('/login');
})

// Serialize
passport.serializeUser(function (hotel, done) {
  done(null, hotel.id);
});

// Deserialize
passport.deserializeUser(function (id, done) {
  Hotel.getHotelById(id, function (err, hotel) {
    done(err, hotel);
  });
});


// Edit Profile
router.post('/profile/edit', checkIfAlreadyRegisered, function (req, res) {
  var name = req.body.name;
  var county = req.body.county;
  var locationName = req.body.locationName;
  var category = req.body.category;
  var stars = req.body.stars;
  var website = req.body.website;

  // validation
  req.checkBody('name', 'Name is required').notEmpty();

  if (website && (!website.includes("http://") && !website.includes("https://"))) website = 'http://' + website;

  var errors = req.validationErrors();

  if (errors) {

    async.parallel({
      counties: callback => {
        County.find({}).exec(callback);
      },
      categories: callback => {
        Category.find({}).exec(callback);
      },
      hotel: callback => {
        Hotel.findById(req.user._id).exec(callback);
      }
    }, (err, results) => {
      if (err) {
        res.status(500).json({ error: err });
      }
      res.render('hotel-profile-edit', {
        counties: results.counties,
        categories: results.categories,
        errors,
        hotel: results.hotel
      })
    });
  } else {
    var updateHotel = Hotel({
      _id: req.user._id,
      name: name,
      username: req.user.username,
      password: req.user.password,
      county,
      locationName,
      category,
      stars,
      website
    });

    // Update Room
    Hotel.findByIdAndUpdate(req.user._id, updateHotel, {}, function (err, hotel) {
      if (err) {
        return res.status(500).json({ "error": err });
      }
      req.flash('success_msg', 'Profile updated');
      res.redirect('/hotels/profile/' + req.user._id);
    });

  }

});

module.exports = router;