const express         = require('express');
const router          = express.Router();
const passport        = require('passport');
const LocalStrategy   = require('passport-local').Strategy;
const multer          = require('multer');
const path            = require('path');

// Models
const Hotel = require('../models/hotel');

// Set storage engine
const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Init upload
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5000000 // 5mb, million bytes
  },
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  }
}).single('hotelPhoto');

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

// Check permission to delete photo
const checkPermissionToDelete = (req, res, next) => {
  if (req.isAuthenticated() && req.params.id == req.user._id) {
    return next();
  } else {
    req.flash('error_msg', 'Not allowed');
    res.redirect('/login');
  }
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
router.post('/upload', checkIfLoggedIn, (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      req.flash('custom_errors', err);
      res.redirect('/hotels/profile/photo');
    }
    else {      
      if (req.file == undefined) {
        req.flash('custom_errors', 'No photo uploaded');
        res.redirect('/hotels/profile/photo');
      }
      else {
        // Save Photo        
        const updateHotel = Hotel({
          _id: req.user._id,
          name: req.user.name,
          username: req.user.username,
          password: req.user.password,
          county: req.user.county,
          locationName: req.user.locationName,
          category: req.user.category,
          stars: req.user.stars,
          website: req.user.website,
          photo: req.file.filename
        });

        Hotel.findByIdAndUpdate(req.user._id, updateHotel, {}, (err, hotel) => {
          if (err) {
            req.flash('custom_errors', err);
            res.redirect('/hotels/profile/photo');
          }
          req.flash('success_msg', 'Photo uploaded');
          res.redirect('/hotels/profile/photo');
        });
      }
    }
  });
})

// Delete Photo
router.delete('/:id', checkIfLoggedIn, checkPermissionToDelete, (req, res, next) => {

  // Update Hotel        
  const updateHotel = Hotel({
    _id: req.user._id,
    name: req.user.name,
    username: req.user.username,
    password: req.user.password,
    county: req.user.county,
    locationName: req.user.locationName,
    category: req.user.category,
    stars: req.user.stars,
    website: req.user.website,
    photo: null
  });

  Hotel.findByIdAndUpdate(req.user._id, updateHotel, {}, (err, hotel) => {
    if (err) {      
      req.flash('custom_errors', err);
      res.redirect('/hotels/profile/photo');
    }
    res.sendStatus(200);
  });

});

module.exports = router;