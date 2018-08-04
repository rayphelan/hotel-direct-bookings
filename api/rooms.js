var express = require('express');
var mongoose = require('mongoose');

// Models
var Room = require('../models/room');


// Get Room
module.exports.getRoom = function (req, res, cb) {

  Room.
    find({ '_id': req.params.id}).
    sort({ '_id': -1 }).
    exec(function (error, rooms) {
      return error ? cb(error) : cb(null, rooms);
    });

}

// Get Rooms
module.exports.getRooms = function (req, res, cb) {

  Room.
    find().
    sort({ '_id': -1 }).
    exec(function (error, rooms) { 
      return error? cb(error): cb(null, rooms);
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