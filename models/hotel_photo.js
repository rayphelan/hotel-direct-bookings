var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var hotelPhotoSchema = Schema({
  _id: Schema.Types.ObjectId,
  hotel: { type: Schema.Types.ObjectId, ref: 'hotels' },
  src: String
});

module.exports = mongoose.model('hotel_photo', hotelPhotoSchema);
