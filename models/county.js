const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const countySchema = Schema({
  _id:    Schema.Types.ObjectId,  
  name:   String,
  photo:  String
});

module.exports = mongoose.model('county', countySchema);
