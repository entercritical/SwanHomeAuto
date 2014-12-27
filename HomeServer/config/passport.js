// config/passport.js

// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;
var bcrypt   = require('bcrypt-nodejs');
var mysql_info = require('./mysql-info');
// methods ======================
// generating a hash
var generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
var validPassword = function(password, crypted) {
    return bcrypt.compareSync(password, crypted);
};

// load up the user model
//var User       		= require('../models/user');
var mysql      = require('mysql');
var connection = mysql.createConnection(mysql_info);

connection.connect(function(err) {
    if (err) {
        console.error('error connecting: ' + err.stack);
        return;
    }
    console.log('connected as id ' + connection.threadId);
});


// expose this function to our app using module.exports
module.exports = function(passport) {

	// =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        //console.log("serializeUser" + user);
        done(null, user);
    });

    // used to deserialize the user
    passport.deserializeUser(function(user, done) {
        //User.findById(id, function(err, user) {
        //console.log("deserializeUser" + user);
        done(null, user);
        //});
    });

 	// =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
	// by default, if there was no name, it would just be called 'local'

    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'name',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, name, password, done) {
		// find a user whose email is the same as the forms email

        connection.query('SELECT * FROM users WHERE name = ?', name, function(err, user) {
            // if there are any errors, return the error
            if (err)
                return done(err);

            // check to see if theres already a user with that email
            if (user.length != 0) {
                return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
            } else {
                var encrypt = generateHash(password);
                console.log("insert " + name + " " + encrypt);
                connection.query("INSERT INTO users VALUES ( '" + name + "','" + encrypt + "')", function (err, user) {
                    if (err)
                        throw err;
                    return done(null, {name: name, password: encrypt});
                });
            }

        });

    }));

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'name',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, name, password, done) { // callback with email and password from our form
        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        connection.query('SELECT * FROM users WHERE name = ?', name, function(err, user) {
            // connected! (unless `err` is set)
            // if there are any errors, return the error before anything else
            if (err)
                return done(err);

            // if no user is found, return the message
            if (user.length == 0)
                return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash

            // if the user is found but the password is wrong
            if (!validPassword(password, user[0].password))
                return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

            // all is well, return successful user
            return done(null, {name: user[0].name, password: user[0].password});
        });

    }));

};
