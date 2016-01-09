


module.exports = (function () {
    var state = false;
    var timer;
    var btSerial = new (require('bluetooth-serial-port')).BluetoothSerialPort();
    var btAddress;
    var btChannel;
    var temperature = 0;
    var humidity = 0;
    var cbUpdate;

    function handleData(data) {
        var head = parseInt(data.substr(2, 2), 16);

        if (String.fromCharCode(head) == "T") { // temperature, humidity
            temperature = parseInt(data.substr(4, 2), 16);
            humidity = parseInt(data.substr(6, 2), 16);

            if (cbUpdate) {
                cbUpdate.update(temperature, humidity);
            }
        }
    }

    btSerial.on('found', function(address, name) {
        btSerial.findSerialPortChannel(address, function(channel) {
            btSerial.connect(address, channel, function() {
                console.log('blanket connected : ' + address + ' ' + channel);
                btAddress = address;
                btChannel = channel;
                power_off();

                var buffer = "";
                var pattern = new RegExp(/^02.*03$/);

                btSerial.on('data', function (data) {
                    buffer += data.toString('hex');
                    if (pattern.test(buffer)) { // test with a regex
                        console.log('data: ', buffer);
                        handleData(buffer);
                        buffer = "";
                    }
                });
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
        console.log("blanket on: timeout = " + hour + " hour");
        state = true;
        if (btSerial.isOpen()) {
            btSerial.write(new Buffer('35', 'utf-8'), function (err, bytesWritten) {
                if (err) console.log(err);
            });
            timer = setTimeout(power_off, hour * 60 * 60 * 1000);
        } else {
            console.log("blanket connection error, re-connect");
            btSerial.inquire();
        }
    };

    var power_off = function() {
        console.log("blanket off");
        state = false;
        if (btSerial.isOpen()) {

            btSerial.write(new Buffer('24', 'utf-8'), function (err, bytesWritten) {
                if (err) console.log(err);
            });
            clearTimeout(timer);
        } else {
            console.log("blanket connection error, re-connect");
            btSerial.inquire();
        }
    };

    return {
        on: function (hour) {
            power_on(hour);
        },
        off: function () {
            power_off();
        },
        getState: function () {
            return state;
        },
        readDHT: function(cb) {
            cbUpdate = cb;
            if (btSerial.isOpen()) {
                btSerial.write(new Buffer('6', 'utf-8'), function (err, bytesWritten) {
                    if (err) console.log(err);
                });
            } else {
                console.log("blanket connection error, re-connect");
                btSerial.inquire();
            }
            return {temperature: temperature, humidity: humidity};
        }
    };
}());