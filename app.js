const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const morgan = require('morgan');
const mongoose = require('mongoose');
const port = process.env.PORT || 3000;


// Set up Database
mongoose.connect('mongodb://rayphelan:Student17119847!@ds259111.mlab.com:59111/hotel-direct-bookings-17119847', {
  useNewUrlParser: true
});

// Database Connection
const db = mongoose.connection;

// Set up App
const app = express();

// Set up View Engine
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({ 
  defaultLayout: 'layout'
}));
app.set('view engine', 'handlebars');

// Set up Body Parser and Cookie Parser
//app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Set up Public Directory
app.use(express.static(path.join(__dirname, 'public')));

// Set up Session
app.use(session({
  secret: 'raymond',
  saveUninitialized: true,
  resave: true
}));

// Set up Passport
app.use(passport.initialize());
app.use(passport.session());

// Set up Express Validator
app.use(expressValidator({
  errorFormatter: function (param, msg, value) {
    const namespace = param.split('.')
      , root = namespace.shift()
      , formParam = root;

    while (namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param: formParam,
      msg: msg,
      value: value
    };
  }
}));

// Set up Flash messages
app.use(flash());
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.custom_errors = req.flash('custom_errors');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});

// Routes
const index = require('./routes/index');
const hotels = require('./routes/hotels');
const api = require('./api/api');
const hotel_photos = require('./routes/hotel_photos');
const room_photos = require('./routes/room_photos');
const categories = require('./routes/categories');
const counties = require('./routes/counties');
app.use('/', index);
app.use('/hotels', hotels);
app.use('/api', api);
app.use('/hotel_photos', hotel_photos);
app.use('/room_photos', room_photos);
app.use('/categories', categories);
app.use('/counties', counties);



// Set up listening port
app.set('port', port);

// Run server
app.listen(app.get('port'), function () {
  console.log('Server running on port ' + app.get('port'));
});

