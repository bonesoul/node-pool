//
//     hypeengine
//     Copyright (C) 2013 - 2017, Hüseyin Uslu, Int6ware - http://www.int6ware.com
//
'use strict';

const winston = require('winston');
const events = require('events');
const bignum = require('bignum');
const crypto = require('crypto');
const algorithms = require('algorithms/algorithms');

var shareManager = module.exports = function () {
  var _this = this;


};

shareManager.prototype.__proto__ = events.EventEmitter.prototype;
