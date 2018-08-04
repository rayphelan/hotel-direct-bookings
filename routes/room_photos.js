// Set up variables
const express         = require('express');
const router          = express.Router();
const passport        = require('passport');
const LocalStrategy   = require('passport-local').Strategy;
const multer          = require('multer');
const path            = require('path');
const async           = require('async');

// Models
const Room      = require('../models/room');
const Hotel     = require('../models/hotel');
const County    = require('../models/county');
const Category  = require('../models/category');


// Check file type
const checkFileType = (file, cb) => {
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


// Check if logged in
const checkIfLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    req.flash('error_msg', 'You are not logged in');
    res.redirect('/login');
  }
}


// Room Page
router.get('/:hotel_id', checkIfLoggedIn, (req, res) => {
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
          const updateRoom = Room({
            _id: results.room._id,
            roomName: results.room.roomName,
            roomPrice: results.room.roomPrice,
            photo: req.file.filename
          });

          Room.findByIdAndUpdate(req.params.room_id, updateRoom, {}, (err, room) => {
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
    const updateRoom = Room({
      _id: results.old_room._id,
      roomName: results.old_room.roomName,
      roomPrice: results.old_room.roomPrice,
      photo: ''
    });

    Room.findByIdAndUpdate(req.params.id, updateRoom, {}, (err, room) => {
      if (err) {
        req.flash('custom_errors', err);
        res.redirect('/room_photos/' + req.params.room_id);
      }
      res.sendStatus(200);
    });
  });

});


module.exports = router;