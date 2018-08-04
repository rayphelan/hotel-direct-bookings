var express = require('express');
var router = express.Router();

var roomAPI = require('./rooms');
var countyAPI = require('./counties');

// Counties
router.get('/counties', (req, res) => {
  countyAPI.getCounties(req, res, (error, counties) => {
    if (error) {
      if (req.query.format == 'web') {
        console.log('error: ' + error);
      }
      else {
        res.json({ 'error': error });
      }
    }
    else {
      if (req.query.format == 'web') {
        
      }
      else {
        res.json(counties);
      }
    }
  })
});


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