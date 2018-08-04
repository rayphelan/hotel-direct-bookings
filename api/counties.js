var express = require('express');
var mongoose = require('mongoose');

// Models
var County = require('../models/county');

// All Counties
module.exports.allCounties = function (cb) {

  County.
    find().
    sort({ 'name': 1 }).
    exec(function (error, counties) { 
      return error? cb(error): cb(null, counties);
    });

}
