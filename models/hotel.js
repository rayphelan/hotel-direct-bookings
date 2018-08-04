const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;

const HotelSchema = mongoose.Schema({
  username: {
    type: String,
    index: true
  },
  password: String,
  stars:  Number,
  name: String,
  category: { 
    type: Schema.Types.ObjectId, 
    ref: 'category' 
  },
  county: {
    type: Schema.Types.ObjectId,
    ref: 'county'
  },
  locationName: String,
  website: String,
  photo: String
});

const Hotel = module.exports = mongoose.model('Hotel', HotelSchema);

// Create Hotel
module.exports.createHotel = (newHotel, callback) => {
  bcrypt.genSalt(10, function (err, salt) {
    bcrypt.hash(newHotel.password, salt, (err, hash) => {
      newHotel.password = hash;
      newHotel.save(callback);
    })
  })
}

// Get Hotel by Username
module.exports.getHotelByUsername = (username, callback) => {
  const query = { username: username };
  Hotel.findOne(query, callback);
}

// Get Hotel by ID
module.exports.getHotelById = (id, callback) => {
  Hotel.findById(id, callback);
}

// Compare Password
module.exports.comparePassword = (candidatePassword, hash, callback) => {
  bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
    if (err) throw err;
    callback(null, isMatch);
  });
}

