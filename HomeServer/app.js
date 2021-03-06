var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mysql_info = require('./config/mysql-info');
var recaptcha_info = require('./config/recaptcha-info');

var rcswitch = require('rcswitch');

var codesend = require('./routes/codesend');

var dht = require('dht-sensor');

var light = require('./light');
var boiler = require('./boiler');
var blanket = require('./blanket');
// dummy blanket
//var blanket = {
//    readDHT: function() {
//        return { temperature: 25, humidity: 40 };
//    },
//    getState: function() {
//        return false;
//    },
//    on: function() {},
//    off: function() {}
//};

var session = require('express-session')
var passport = require('passport');
var flash = require('connect-flash');
require( "console-stamp" )( console, { pattern : "yyyy/mm/dd HH:MM:ss.l" } ); // log timestamp
require('./config/passport')(passport); // pass passport for configuration

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'jade');
app.set('view engine', 'ejs'); // set up ejs for templating

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//app.use('/api/codesend', codesend);

var mysqlStore = require('connect-mysql')(session),
    options = {
        config: {
            user: mysql_info.user,
            password: mysql_info.password,
            database: mysql_info.database
        }
    };
// required for passport
app.use(session({
    secret: mysql_info.session_secret,
    cookie: {
        maxAge: (24 * 3600 * 1000 * 30)
    },
    resave: false,
    saveUninitialized: false,
    store: new mysqlStore(options)
}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

app.get('/', function (req, res) {
    if (req.isAuthenticated()) {
        res.redirect('/homeauto');
    } else {
        res.render('index.ejs'); // load the index.ejs file
    }
});

// show the login form
app.get('/login', function (req, res) {
    // render the page and pass in any flash data if it exists
    res.render('login.ejs', {message: req.flash('loginMessage'), sitekey: recaptcha_info.recaptcha_sitekey});
});

// process the login form
app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/homeauto', // redirect to the secure profile section
    failureRedirect: '/login', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
}));

//// show the signup form
app.get('/signup', function (req, res) {

    // render the page and pass in any flash data if it exists
    res.render('signup.ejs', {message: req.flash('signupMessage'), sitekey: recaptcha_info.recaptcha_sitekey});
});

// process the signup form
app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/homeauto', // redirect to the secure profile section
    failureRedirect: '/signup', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
}));

// we will use route middleware to verify this (the isLoggedIn function)
app.get('/homeauto', isLoggedIn, function (req, res) {
    var livingRoom = dht.read(11, 18);
    var bedRoom = blanket.readDHT();

    res.render('homeauto.ejs', {
        user: req.user, // get the user out of session and pass to template
        livingRoomTemp: livingRoom.temperature,
        livingRoomHum: livingRoom.humidity,
        bedRoomTemp: bedRoom.temperature,
        bedRoomHum: bedRoom.humidity,
        lightState: light.getState(),
        boilerState: boiler.getState(),
        blanketState: blanket.getState()
    });
});

app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

app.post('/api/codesend', isLoggedIn, function (req, res) {
    var unitCode = req.query.unitCode;
    var binCode = parseInt(unitCode, 10).toString(2);

    console.log("codesend : " + unitCode);

    rcswitch.send(binCode);

    res.redirect("back");
});

app.post('/api/boilerOn', isLoggedIn, function (req, res) {
    var hour = req.query.hour;

    boiler.on(hour);
    res.redirect("back");
});

app.post('/api/boilerOff', isLoggedIn, function (req, res) {
    boiler.off();
    res.redirect("back");
});

app.post('/api/blanketOn', isLoggedIn, function (req, res) {
    var hour = req.query.hour;
    blanket.on(hour);
    res.redirect("back");
});

app.post('/api/blanketOff', isLoggedIn, function (req, res) {
    blanket.off();
    res.redirect("back");
});

app.post('/api/lightOn', isLoggedIn, function (req, res) {
    var place = req.query.place;
    light.on(place);
    res.redirect("back");
});

app.post('/api/lightOff', isLoggedIn, function (req, res) {
    var place = req.query.place;
    light.off(place);
    res.redirect("back");
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// route middleware to make sure
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        //res.status(err.status || 500);
        //res.render('error', {
        //    message: err.message,
        //    error: err
        //});
        console.log(err);
        res.redirect('/');
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
