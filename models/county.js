var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var countySchema = Schema({
  _id: Schema.Types.ObjectId,  
  name: String
});

module.exports = mongoose.model('county', countySchema);
