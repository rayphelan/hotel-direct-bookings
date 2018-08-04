const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const roomSchema = Schema({
  _id: Schema.Types.ObjectId,
  hotel: { type: Schema.Types.ObjectId, ref: 'hotels'},
  roomName: String,
  roomPrice: Number,
  photo: String
});

module.exports = mongoose.model('room', roomSchema);
