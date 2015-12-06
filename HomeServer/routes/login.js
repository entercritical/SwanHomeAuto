/**
 * Created by janush on 14. 12. 14..
 */
var express = require('express');
var router = express.Router();

var passport = require('passport')
    , LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy({
        usernameField: 'userid',
        passwordField: 'password',
        passReqToCallback: true
    }
    , function (req, userid, password, done) {
        if (userid == 'hello' && password == 'world') {
            var user = {
                'userid': 'hello',
                'email': 'hello@world.com'
            };
            return done(null, user);
        } else {
            return done(null, false);
        }
    }
));

/* GET users listing. */
router.get('/', function (req, res) {
    res.send('respond with a resource');
});

module.exports = router;
