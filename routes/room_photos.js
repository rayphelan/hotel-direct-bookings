var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var multer = require('multer');
var path = require('path');
var async = require('async');

// Models
var Room = require('../models/room');
var Hotel = require('../models/hotel');
var County = require('../models/county');
var Category = require('../models/category');

router.get('/:hotel_id', checkIfLoggedIn, function(req, res) {
  // Perform operations in parallel using Async
  async.parallel({
    room: callback => {
      Room.findById(req.params.hotel_id)
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
    
    res.render('room', {
      room: results.room,
      counties: results.counties,
      categories: results.categories
    });
  });  
});

// Set storage engine
const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Init upload
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5000000 // 5mb, million bytes
  },
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  }
}).single('roomPhoto');

// Check file type
function checkFileType(file, cb) {
  // allowed extensions
  const fileTypes = /jpg|jpeg|png|gif/;
  // check ext
  const extname = fileTypes.test(path.extname(file.originalname).toLocaleLowerCase());
  // check mime
  const mimetype = fileTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  }
  else {
    cb('Error: Images only');
  }
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



// Upload
router.post('/upload/:room_id', checkIfLoggedIn, (req, res) => {
  
  // Perform operations in parallel using Async
  async.parallel({
    room: callback => {
      Room.findById(req.params.room_id)        
        .exec(callback);
    }
  }, (err, results) => {
    if (err) {
      req.flash('custom_errors', err);
      res.redirect('/room_photos/' + req.params.room_id);
    }

    // Upload
    upload(req, res, (err) => {
      if (err) {
        req.flash('custom_errors', err);
        res.redirect('/room_photos/' + req.params.room_id);
      }
      else {
        if (req.file == undefined) {
          req.flash('custom_errors', 'No photo uploaded');
          res.redirect('/room_photos/' + req.params.room_id);
        }
        else {
          // Save Photo        
          var updateRoom = Room({
            _id: results.room._id,
            roomName: results.room.roomName,
            roomPrice: results.room.roomPrice,
            photo: req.file.filename
          });

          Room.findByIdAndUpdate(req.params.room_id, updateRoom, {}, function (err, room) {
            if (err) {
              req.flash('custom_errors', err);
              res.redirect('/room_photos/' + req.params.room_id);
            }
            req.flash('success_msg', 'Photo uploaded');
            res.redirect('/room_photos/' + req.params.room_id);
          });

        }
      }
    });
  });  
})


// Delete Photo
router.delete('/:id', checkIfLoggedIn, (req, res, next) => {

  // Perform operations in parallel using Async
  async.parallel({
    old_room: callback => {
      Room.findById(req.params.id)        
        .exec(callback);
    }
  }, (err, results) => {
    if (err) {
      req.flash('custom_errors', err);
      res.redirect('/room_photos/' + req.params.room_id);
    }
    // Update Room        
    var updateRoom = Room({
      _id: results.old_room._id,
      roomName: results.old_room.roomName,
      roomPrice: results.old_room.roomPrice,
      photo: ''
    });

    Room.findByIdAndUpdate(req.params.id, updateRoom, {}, function (err, room) {
      if (err) {
        console.log(err);
        req.flash('custom_errors', err);
        res.redirect('/room_photos/' + req.params.room_id);
      }
      res.sendStatus(200);
    });
  });

});


// Check permission to delete photo
function checkPermissionToDelete(req, res, next) {
  if (req.isAuthenticated() && req.params.id == req.user._id) {
    return next();
  } else {
    req.flash('error_msg', 'Not allowed');
    res.redirect('/login');
  }
}

module.exports = router;