const express = require('express');
const expressValidator = require('express-validator');
const port = process.env.PORT || 8080;
const mongoose = require('mongoose');
const flash = require('connect-flash');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const compression = require('compression');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const exphbs = require('express-handlebars');

// Set up app
const app = express();

// Connect database
mongoose.connect('mongodb://rayphelan:Student17119847!@ds259111.mlab.com:59111/hotel-direct-bookings-17119847', {
  useNewUrlParser: true
});
const db = mongoose.connection;


// Use moment.js in pug files
app.locals.moment = require('moment');

//	Use Compression
app.use(compression());

// Logs for development
app.use(morgan('dev'));

// Handle Cookies
app.use(cookieParser());

// Handle JSON
app.use(bodyParser.json());

// Handle Form data
app.use(bodyParser.urlencoded({ extended: true }));

//	Public Directory
app.use(express.static(path.join(__dirname + '/public')));


// Routes
const index = require('./routes/index');
const hotels = require('./routes/hotels');
app.use('/', index);
app.use('/hotels', hotels);

// Template Engine
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({ defaultLayout: 'layout' }));
app.set('view engine', 'handlebars');

// Use Body Parser and Cookie Parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Public Directory
app.use(express.static(path.join(__dirname, 'public')));

// Set up Session
app.use(session({
  secret: 'raymondphelanNCI17119847',
  saveUninitialized: true,
  resave: true
}));

// Set up Passport
app.use(passport.initialize());
app.use(passport.session());

// Express Validator
app.use(expressValidator({
  errorFormatter: function (param, msg, value) {
    var namespace = param.split('.')
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

// Flash messages
app.use(flash());
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});

// Port
app.set('port', (process.env.PORT || 3000));

// Start server
app.listen(app.get('port'), function () {
  console.log('Server running on port ' + app.get('port'));
});
