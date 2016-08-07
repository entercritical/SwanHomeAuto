var rcswitch = require('rcswitch');

rcswitch.enableTransmit(0);

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

module.exports = (function () {
    var light_state = false;
    var LIGHT = 0x01 << 16;
    var LIVING_ROOM = 0x01 << 8;
    var ON = 0x01;
    var OFF = 0x02;

    var light_on = function(place) {
        console.log("light_on: place = " + place);
        light_state = true;
        rcswitch.send(Dec2Bin(LIGHT|LIVING_ROOM|ON, 24));
    };

    var light_off = function(place) {
        console.log("light_off: place = " + place);
        light_state = false;
        rcswitch.send(Dec2Bin(LIGHT|LIVING_ROOM|OFF, 24));
    };

    return {
        on: function (place) {
            light_on(place);
        },
        off: function (place) {
            light_off(place);
        },
        getState: function () {
            return light_state;
        }
    };
}());