const express   = require('express');
const router    = express.Router();

// API Functions
const roomAPI   = require('./rooms');

// Hotel Rooms
router.get('/hotel/:hotel_id/rooms', (req, res) => {
  roomAPI.getHotelRooms(req, res, (error, rooms) => {
    if (error) {
      res.json({ 'error': error });
    }
    else {
      if (req.query.format == 'web') {
        res.render('hotel-room-list', {
          rooms,
          layout: false
        });
      }
      else {
        res.json(rooms);
      }
    }
  });
});

module.exports = router;