//
//     hypeengine
//     Copyright (C) 2013 - 2017, Hüseyin Uslu, Int6ware - http://www.int6ware.com
//
'use strict';

const winston = require('winston');
const events = require('events');

var blockManager = module.exports = function () {
};

blockManager.prototype.__proto__ = events.EventEmitter.prototype;
