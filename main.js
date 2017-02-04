var bleno = require('bleno');
var eddystoneBeacon = require('eddystone-beacon');
var log = require('winston');

// ---------------------------------------------------------------------------------------------------------

DEVICE_NAME = 'RPI-BLE-BLINK';
TX_POWER = -25;
LOG_LEVEL = 'debug';
FLIPFLOP_TIME = 3000;
BEACON_URL = 'https://goo.gl/UL9MK7'; //homeworldsoftware.co.uk

log.level = LOG_LEVEL;

// ---------------------------------------------------------------------------------------------------------
// Service selection
var GattService = require('./services/rpi-gpio/rpi-gpio-service');

//GPIO Module pass to GATT Service
var GPIO = require("./lib/rpi-gpio.js");
var gpio = new GPIO();
var service = new GattService(gpio);

// ---------------------------------------------------------------------------------------------------------
// Hardware Config
/*
LED_PIN     = 23;
// ---------------------------------------------------------------------------------------------------------

*/
// ---------------------------------------------------------------------------------------------------------
// Eddystone / GATT FLip flop

//TEST my change

var BEACON_ADV_STATE = 0;
var GATT_ADV_STATE = 1;

var flipFlopIntervalTimer;
var flipFlopEnabled = true;
var advertisingState = 0;

function info(str) {
    log.log('info', str);
}

function debug(str) {
    log.log('debug', str);
}

function handleError(error) {
    log.log('error', error);
}

bleno.on('stateChange', function(state) {
    debug('on -> stateChange: ' + state);

    if (state === 'poweredOn') {
        start_advertising_flipflop();
    } else {

    }
});

function doFlip() {

    if (!flipFlopEnabled)
        return;

    try {
        advertisingState = 1 - advertisingState;

        if (advertisingState == BEACON_ADV_STATE) {
            info("FLIFLOP: BEACON_ADV_STATE");

            stop_service_advertising();
            start_beacon_advertising();
        } else {
            info("FLIFLOP: GATT_ADV_STATE");
            stop_beacon_advertising();
            start_service_advertising();
        }

    } catch (err) {
        handleError(JSON.stringify(err));
    }
}

function start_advertising_flipflop() {
    flipFlopIntervalTimer = setInterval(doFlip, FLIPFLOP_TIME);
    doFlip();
}

function stop_advertising_flipflop() {
    if (flipFlopIntervalTimer) {
        clearInterval(flipFlopIntervalTimer);
        flipFlopIntervalTimer = undefined;
    }
}

function start_beacon_advertising() {
    debug("start_beacon_advertising");
    var url = BEACON_URL;
    eddystoneBeacon.advertiseUrl(url, { name: DEVICE_NAME }, { txPowerLevel: TX_POWER }); //
}

function stop_beacon_advertising() {
    debug("stop_beacon_advertising");
    eddystoneBeacon.stop();
    bleno.stopAdvertising();
    bleno.disconnect();
}

// -- Non Eddystone beacon bleno code
function start_service_advertising() {
    debug("start_service_advertising");
    bleno.startAdvertising(DEVICE_NAME, [service.uuid]);
}

function stop_service_advertising() {
    debug("stop_service_advertising");
    bleno.stopAdvertising();
    bleno.disconnect();
}

bleno.on('advertisingStart', function(error) {
    debug('on -> advertisingStart: ' + (error ? 'error ' + error : 'success'));

    if (!error) {
        //if (advertisingState = GATT_ADV_STATE) {
        debug("Advertising Services");
        bleno.setServices([
            service
        ]);
        //}
    }
});

bleno.on('accept', function(clientAddress) {
    info('onConnect from: ' + clientAddress);
    flipFlopEnabled = false;
});

bleno.on('disconnect', function(clientAddress) {
    info('onDisconnect from: ' + clientAddress);
    flipFlopEnabled = true;
});


// ---------------------------------------------------------------------------------------------------------
// Notes

/*

// -- Generic GPIO serve

/*

var GPIOService = require('./services/rpi-gpio/rpi-gpio-service');
var gpioService = new GPIOService(gpio);  // from: ./lib/rpi-gpio.js

*/