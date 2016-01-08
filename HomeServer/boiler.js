var gpio = require('rpi-gpio');

module.exports = (function () {
    var boiler_state = false;
    var boiler_timer;
    var boiler_on = function(hour) {
        console.log("boiler_on: timeout = " + hour + " hour");
        boiler_state = true;
        gpio.write(15, boiler_state);
        boiler_timer = setTimeout(boiler_off, hour * 60 * 60 * 1000);
    };
    var boiler_off = function() {
        console.log("boiler_off");
        boiler_state = false;
        gpio.write(15, boiler_state);
        clearTimeout(boiler_timer);
    };

    gpio.on('change', function (channel, value) {
        if (channel == 16 && value == true) {
            console.log('Toggle button pushed');
            if (boiler_state == true) {
                boiler_off()
            } else {
                boiler_on(1);
            }
        }
    });
    gpio.setup(15, gpio.DIR_OUT);
    gpio.setup(16, gpio.DIR_IN, gpio.EDGE_BOTH);

    return {
        on: function (hour) {
            boiler_on(hour);
        },
        off: function () {
            boiler_off();
        },
        getState: function () {
            return boiler_state;
        }
    };
}());