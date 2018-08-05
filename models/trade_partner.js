const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;

const TradePartnerSchema = mongoose.Schema({
  username: {
    type: String,
    index: true
  },
  password: String,
  name: String,
  locationName: String,
  website: String
});

const TradePartner = module.exports = mongoose.model('TradePartner', TradePartnerSchema);

// Create TradePartner
module.exports.createTradePartner = (newTradePartner, callback) => {
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(newTradePartner.password, salt, (err, hash) => {
      newTradePartner.password = hash;
      newTradePartner.save(callback);
    })
  })
}

// Get TradePartner by Username
module.exports.getTradePartnerByUsername = (username, callback) => {
  const query = { username: username };
  TradePartner.findOne(query, callback);
}

// Get TradePartner by ID
module.exports.getTradePartnerById = (id, callback) => {
  TradePartner.findById(id, callback);
}

// Compare Password
module.exports.comparePassword = (candidatePassword, hash, callback) => {
  bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
    if (err) throw err;
    callback(null, isMatch);
  });
}

