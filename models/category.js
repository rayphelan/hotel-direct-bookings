const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categorySchema = Schema({
  _id:    Schema.Types.ObjectId,  
  name:   String,
  photo:  String
});

module.exports = mongoose.model('category', categorySchema);
