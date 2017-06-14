//
//     hypeengine
//     Copyright (C) 2013 - 2017, Hüseyin Uslu, Int6ware - http://www.int6ware.com
//
'use strict';

const bignum = require('bignum');
const util = require('common/utils.js');

const diff1 = global.diff1 = 0x00000000ffff0000000000000000000000000000000000000000000000000000;

module.exports = global.algorithms = {
  sha256: {
    multiplier: 1,
    hash: function () {
      return function () {
        return util.sha256d.apply(this, arguments);
      };
    }
  },
  scrypt: {
    multiplier: Math.pow(2, 16),
    hash: function (coinConfig) {
      var nValue = coinConfig.nValue || 1024;
      var rValue = coinConfig.rValue || 1;
      return function (data) {
        return null; //hashlib.scrypt(data, nValue, rValue);
      };
    }
  }
};
