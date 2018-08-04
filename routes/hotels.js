// Set up variables
const express         = require('express');
const router          = express.Router();
const passport        = require('passport');
const mongoose        = require('mongoose');
const LocalStrategy   = require('passport-local').Strategy;
const async           = require('async');


// Models
const Hotel     = require('../models/hotel');
const Room      = require('../models/room');
const County    = require('../models/county');
const Category  = require('../models/category');


// Check if hotel is already registered
const checkIfAlreadyRegisered = (req, res, next) => {
  var username = req.body.username;
  Hotel.getHotelByUsername(username, (err, hotel) => {
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
const checkIfLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    req.flash('error_msg', 'You are not logged in');
    res.redirect('/login');
  }
}


//  Browse Hotels
router.get('/', (req, res) => {
  // Perform operations in parallel using Async
  async.parallel({
    counties: callback => {
      County.find({}).exec(callback);
    },
    categories: callback => {
      Category.find({}).exec(callback);
    },
    hotels: callback => {
      Hotel.find({})
      .populate('category county')
      .exec(callback);
    }
  }, (err, results) => {
    if (err) {
      res.status(500).json({ error: err });
    }
    res.render('hotels', {
      counties: results.counties,
      categories: results.categories,
      hotels: results.hotels
    });
  });
});


//  Browse Hotels by category
router.get('/category/:id', (req, res) => {
  // Perform operations in parallel using Async
  async.parallel({
    counties: callback => {
      County.find().exec(callback);
    },
    categories: callback => {
      Category.find({}).exec(callback);
    },
    hotels: callback => {
      Hotel.find({ 'category': req.params.id })
      .populate('category county')
      .exec(callback);
    }
  }, (err, results) => {
    if (err) {
      res.status(500).json({ error: err });
    }
    res.render('hotels', {
      counties: results.counties,
      categories: results.categories,
      hotels: results.hotels
    });
  });
});


//  Browse Hotels by county
router.get('/county/:id', (req, res) => {
  // Perform operations in parallel using Async
  async.parallel({
    counties: callback => {
      County.find().exec(callback);
    },
    categories: callback => {
      Category.find({}).exec(callback);
    },
    hotels: callback => {
      Hotel.find({ 'county': req.params.id })
        .populate('category county')
        .exec(callback);
    }
  }, (err, results) => {
    if (err) {
      res.status(500).json({ error: err });
    }
    res.render('hotels', {
      counties: results.counties,
      categories: results.categories,
      hotels: results.hotels
    });
  });
});


//  View Hotel Room
router.get('/room/:id', (req, res) => {
  // Perform operations in parallel using Async
  async.parallel({
    counties: callback => {
      County.find().exec(callback);
    },
    categories: callback => {
      Category.find({}).exec(callback);
    },
    room: callback => {
      Room.findById(req.params.id)
      .exec(callback);
    }
  }, (err, results) => {
    if (err) {
      res.status(500).json({ error: err });
    }
    res.render('view-room', {
      counties: results.counties,
      categories: results.categories,
      room: results.room
    });
  });
});


// Hotel Dashboard
router.get('/dashboard', checkIfLoggedIn, (req, res) => {
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


// Edit Hotel Photo page
router.get('/profile/photo', checkIfLoggedIn, (req, res) => {
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
    res.render('hotel-profile-photo', {
      hotel: results.hotel,
      hotel_photo: results.hotel_photo,
      counties: results.counties,
      categories: results.categories
    });
  });
});


// Edit Hotel Profile
router.get('/profile/edit', checkIfLoggedIn, (req, res) => {
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
router.get('/profile/:id', (req, res) => {
  // Perform operations in parallel using Async
  async.parallel({
    rooms: callback => {
      Room.find({'hotel': req.params.id})
      .exec(callback);
    },
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
      rooms: results.rooms,
      counties: results.counties,
      categories: results.categories,
      isOwner: (req.user? (req.user._id==req.params.id? true: false): false)
    });
  });
});


// Hotel Room New Page (Ajax)
router.get('/rooms/new', checkIfLoggedIn, (req, res) => {
  res.render('hotel-room-new', {layout:false});
});


// Hotel Edit Room Page (Ajax)
router.get('/rooms/edit/:id', checkIfLoggedIn, (req, res) => {    
  Room.
    find({ '_id': req.params.id }).
    exec((error, room) => {
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
    exec((error, room) => {
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
  
  // Form variables
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
      roomPrice: roomPrice,
      photo: ''
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

  // Perform operations in parallel using Async
  async.parallel({
    old_room: callback => {
      Room.findById(req.params.id)
        .exec(callback);
    }
  }, (err, results) => {
    if (err) {
      req.flash('custom_errors', err);
      res.redirect('/hotels/dashboard');
    }
    
    // update room
    var roomName = req.body.roomName;
    var roomPrice = req.body.roomPrice;

    // validation
    req.checkBody('roomName', 'Room Name is required.').notEmpty();
    req.checkBody('roomPrice', 'Room Price is required.').notEmpty();

    const errors = req.validationErrors();

    if (errors) {
      return res.status(400).json({ errors: errors });
    }
    else {

      // Room Instance
      room = new Room({
        roomName: roomName,
        roomPrice: roomPrice,
        photo: results.old_room.photo
      });

      // Update Room
      Room.findByIdAndUpdate(req.params.id, room, {}, (err, room) => {
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
});


//  Delete Room
router.delete('/rooms/:id', checkIfLoggedIn, (req, res, next) => {
  Room.deleteOne({ 
    "_id": req.params.id,
    "hotel": req.user._id
  }, err => {
    if (err) {
      return res.status(401).json({ "error": err });
    }
    res.send(req.params.id);
  });
});


// Register
router.post('/register', checkIfAlreadyRegisered, (req, res) => {
  
  // Form variables
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
    const newHotel = Hotel({
      name,
      username,
      password,
      county,
      locationName,
      category,
      stars,
      website
    });

    Hotel.createHotel(newHotel, (err, hotel) => {
      if (err) throw (err);      
    });

    req.flash('success_msg', 'Success! You are registered. You can log in now.');
    res.redirect('/login');
  }

});


// Passport Local Strategy
passport.use(new LocalStrategy(
  (username, password, done) => {
    Hotel.getHotelByUsername(username, (err, hotel) => {
      if (err) throw (err);
      if (!hotel) {
        return done(null, false, { message: 'Username or Password invalid.' });
      }
      Hotel.comparePassword(password, hotel.password, (err, isMatch) => {
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
  (req, res) => {
    res.redirect('/');
  });


// Logout
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You have logged out successfully.');
  res.redirect('/login');
})


// Serialize
passport.serializeUser((hotel, done) => {
  done(null, hotel.id);
});


// Deserialize
passport.deserializeUser((id, done) => {
  Hotel.getHotelById(id, (err, hotel) => {
    done(err, hotel);
  });
});


// Edit Profile
router.post('/profile/edit', checkIfAlreadyRegisered, (req, res) => {
  
  // Form variables
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
    const updateHotel = Hotel({
      _id: req.user._id,
      name: name,
      username: req.user.username,
      password: req.user.password,
      county,
      locationName,
      category,
      stars,
      website,
      photo: req.user.photo
    });

    // Update Room
    Hotel.findByIdAndUpdate(req.user._id, updateHotel, {}, (err, hotel) => {
      if (err) {
        return res.status(500).json({ "error": err });
      }
      req.flash('success_msg', 'Profile updated');
      res.redirect('/hotels/profile/' + req.user._id);
    });
  }
});


module.exports = router;