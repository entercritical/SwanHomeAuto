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

var gpio = require('rpi-gpio');

var boiler = (function () {

    var boiler_state = false;

    gpio.on('change', function (channel, value) {
        if (channel == 16 && value == true) {
            boiler_state = !boiler_state;
            gpio.write(15, boiler_state);
            console.log('Toggle button pushed, boiler_state ' + boiler_state);
        }
    });
    gpio.setup(15, gpio.DIR_OUT);
    gpio.setup(16, gpio.DIR_IN, gpio.EDGE_BOTH);

    return {
        turnOn: function (hour) {
            console.log("turnOn: set timeout hour = ", hour);
            boiler_state = true;
            gpio.write(15, boiler_state);

            setTimeout(this.turnOff, hour * 60 * 60 * 1000);
        },
        turnOff: function () {
            console.log("turnOff");
            boiler_state = false;
            gpio.write(15, boiler_state);
        },
        getState: function () {
            return boiler_state;
        }
    };
}());

var session = require('express-session')
var passport = require('passport');
var flash = require('connect-flash');
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
    secret: 'homesweethome',
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
    var current = dht.read(11, 18);

    res.render('homeauto.ejs', {
        user: req.user, // get the user out of session and pass to template
        temperature: current.temperature,
        humidity: current.humidity,
        boilerState: boiler.getState()
    });
});

app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

app.post('/codesend', isLoggedIn, function (req, res) {
    var unitCode = req.query.unitCode;
    var binCode = parseInt(unitCode, 10).toString(2);

    console.log("codesend : " + unitCode);

    rcswitch.send(binCode);

    res.redirect("back");
});

app.post('/api/boilerOn', isLoggedIn, function (req, res) {
    var hour = req.query.hour;
    console.log("Boiler On : " + hour);
    boiler.turnOn(hour);
    res.redirect("back");
});

app.post('/api/boilerOff', isLoggedIn, function (req, res) {
    console.log("Boiler Off");
    boiler.turnOff();
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
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
        console.log(err);
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
