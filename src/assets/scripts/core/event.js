/**
 * Event Libray
 *
 * @package     MHW Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (http://scar.tw)
 * @link        https://github.com/scarwu/MHWCalculator
 */

let eventList = {};

function on(name, key, callback) {
    if (undefined === eventList[name]) {
        eventList[name] = {};
    }

    eventList[name][key] = callback;
}

function off(name, key) {
    if (undefined === eventList[name]) {
        return false;
    }

    delete eventList[name][key];
}

function trigger(name, arg) {
    if (undefined === eventList[name]) {
        return false;
    }

    for (let key in eventList[name]) {
        eventList[name][key](arg);
    }
}

export default {
    off: off,
    on: on,
    trigger: trigger
}
