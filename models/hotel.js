var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

var HotelSchema = mongoose.Schema({
  username: {
    type: String,
    index: true
  },
  password: {
    type: String
  },
  email: {
    type: String
  },
  name: {
    type: String
  }
});

var Hotel = module.exports = mongoose.model('Hotel', HotelSchema);

// Create Hotel
module.exports.createHotel = function (newHotel, callback) {
  bcrypt.genSalt(10, function (err, salt) {
    bcrypt.hash(newHotel.password, salt, function (err, hash) {
      newHotel.password = hash;
      newHotel.save(callback);
    })
  })
}

// Get Hotel by Username
module.exports.getHotelByUsername = function (username, callback) {
  var query = { username: username };
  Hotel.findOne(query, callback);
}

// Get Hotel by ID
module.exports.getHotelById = function (id, callback) {
  Hotel.findById(id, callback);
}

// Compare Password
module.exports.comparePassword = function (candidatePassword, hash, callback) {
  bcrypt.compare(candidatePassword, hash, function (err, isMatch) {
    if (err) throw err;
    callback(null, isMatch);
  });
}
