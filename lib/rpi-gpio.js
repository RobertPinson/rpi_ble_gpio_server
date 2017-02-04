var Gpio = require('onoff').Gpio;

function BBL_GPIO(Gpio) {
    this.echoSensors = {};
    this.pins = {};
}

// TODO: destructor:
// for all pins ;pin.unexport();    // Unexport GPIO and free resources

BBL_GPIO.prototype._getPin = function(pinNum, mode) {
    if (!(pinNum in this.pins)) {
        //console.log("pin not found, creating ");
        this.pins[pinNum] = new Gpio(pinNum, mode);
    }
    return this.pins[pinNum];
};

BBL_GPIO.prototype.setPinState = function(pinNum, state) {
    //console.log("Set pin state, pin = " + pinNum + " State = " + state);
    pin = this._getPin(pinNum, 'out');
    pin.writeSync(state); // Turn LED off.
};

BBL_GPIO.prototype.readPinState = function(pinNum) {
    //console.log("read pin state, pin = " + pinNum);
    pin = this._getPin(pinNum, 'in');
    return pin.readSync();
};

BBL_GPIO.prototype.watchPin = function(pinNum, callback) {
    var pin = new Gpio(pinNum, 'in', 'both');
    pin.watch(callback);
};

module.exports = BBL_GPIO;