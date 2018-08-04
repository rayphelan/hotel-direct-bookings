var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var roomSchema = Schema({
  _id: Schema.Types.ObjectId,
  hotel: { type: Schema.Types.ObjectId, ref: 'hotels'},
  roomName: String,
  roomPrice: Number,
  photo: String
});

module.exports = mongoose.model('room', roomSchema);
