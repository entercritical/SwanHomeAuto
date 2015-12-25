//var gpio = require('rpi-gpio');

module.exports = (function () {
    var state = false;
    var timer;
    var power_on = function(hour) {
        state = true;
        //gpio.write(15, state);
        timer = setTimeout(power_off, hour * 60 * 60 * 1000);
    };
    var power_off = function() {
        state = false;
        //gpio.write(15, state);
        clearTimeout(timer);
    };

    /*
     gpio.on('change', function (channel, value) {
     if (channel == 16 && value == true) {
     if (state == true) {
     power_off()
     } else {
     power_on(0.5);
     }
     console.log('Toggle button pushed, state ' + state);
     }
     });
     gpio.setup(15, gpio.DIR_OUT);
     gpio.setup(16, gpio.DIR_IN, gpio.EDGE_BOTH);
     */

    return {
        on: function (hour) {
            console.log("Power on: set timeout hour = ", hour);
            power_on(hour);
        },
        off: function () {
            console.log("Power off");
            power_off();
        },
        getState: function () {
            return state;
        }
    };
}());