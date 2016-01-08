
module.exports = (function () {
    var state = false;
    var timer;
    var btSerial = new (require('bluetooth-serial-port')).BluetoothSerialPort();

    btSerial.on('found', function(address, name) {
        btSerial.findSerialPortChannel(address, function(channel) {
            btSerial.connect(address, channel, function() {
                console.log('blanket connected : ' + address + ' ' + channel);

                //btSerial.write(new Buffer('my data', 'utf-8'), function(err, bytesWritten) {
                //    if (err) console.log(err);
                //});
                //
                //btSerial.on('data', function(buffer) {
                //    console.log(buffer.toString('utf-8'));
                //});
                power_off();
            }, function () {
                console.log('blanket cannot connect');
            });

            // close the connection when you're ready
            btSerial.close();
        }, function() {
            console.log('found nothing');
        });
    });

    btSerial.inquire();

    var power_on = function(hour) {
        if (btSerial.isOpen()) {
            state = true;
            btSerial.write(new Buffer('35', 'utf-8'), function (err, bytesWritten) {
                if (err) console.log(err);
            });
            timer = setTimeout(power_off, hour * 60 * 60 * 1000);
        } else {
            console.log("blanket connection error");
        }
    };

    var power_off = function() {
        if (btSerial.isOpen()) {
            state = false;
            btSerial.write(new Buffer('24', 'utf-8'), function (err, bytesWritten) {
                if (err) console.log(err);
            });
            clearTimeout(timer);
        } else {
            console.log("blanket connection error");
        }
    };

    return {
        on: function (hour) {
            console.log("blanket on: set timeout hour = ", hour);
            power_on(hour);
        },
        off: function () {
            console.log("blanket off");
            power_off();
        },
        getState: function () {
            return state;
        }
    };
}());