// Models
const Room = require('../models/room');

// Get Room
module.exports.getRoom = (req, res, cb) => {
  Room.
    findById(req.params.id).
    exec(function (error, rooms) {
      return error ? cb(error) : cb(null, rooms);
    });
}

// Get Hotel Rooms
module.exports.getHotelRooms = function (req, res, cb) {  
  Room.
    find({'hotel': req.params.hotel_id}).
    sort({ '_id': -1 }).
    exec(function (error, rooms) {      
      return error ? cb(error) : cb(null, rooms);
    });
}