var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var categorySchema = Schema({
  _id: Schema.Types.ObjectId,  
  name: String
});

module.exports = mongoose.model('category', categorySchema);
