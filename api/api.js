var express = require('express');
var router = express.Router();

var roomAPI = require('./rooms');



// Rooms
router.get('/rooms', function (req, res) {

  roomAPI.getRooms(req, res, function (error, rooms) {
    if (error) {
      if(req.query.format == 'web') {
        
      }
      else {
        res.json({ 'error': error });
      }
    }
    else {
      if(req.query.format == 'web') {
        res.render('hotel-room-list',{ 
          rooms: rooms,
          layout: false 
        });
      }
      else {
        res.json(rooms);
      }
    }
  });

});

// Hotel Rooms
router.get('/hotel/:hotel_id/rooms', function (req, res) {

  roomAPI.getHotelRooms(req, res, function (error, rooms) {
    if (error) {
      if (req.query.format == 'web') {

      }
      else {
        res.json({ 'error': error });
      }
    }
    else {
      if (req.query.format == 'web') {
        res.render('hotel-room-list', {
          rooms: rooms,
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