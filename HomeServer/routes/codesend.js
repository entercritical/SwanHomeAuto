var express = require('express');
var router = express.Router();

// var ffi = require("ffi");

var rcswitch = require('rcswitch');

function Dec2Bin(number, nbit) {
    // Convert decimal number to binary
    var tmp = '';
    var result = '';

    if (!isNaN(number)) {
        result = parseInt(number, 10).toString(2);
    }

    if (result.length < nbit) {
        for (var i = 0; i <= nbit - result.length; ++i) {
            tmp += '0';
        }
    }

    return tmp + result;
}

rcswitch.enableTransmit(0);


/* POST users listing. */
router.post('/', isLoggedIn, function (req, res) {
    var unitCode = req.query.unitCode;
    var binCode = Dec2Bin(unitCode, 24);

    console.log("codesend : " + unitCode);

    rcswitch.send(binCode);

    res.send('codesended');
});

// route middleware to make sure
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}
module.exports = router;
