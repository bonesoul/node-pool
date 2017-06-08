//
//     hypeserv
//     Copyright (C) 2013 - 2017, Hüseyin Uslu, Int6ware - http://www.int6ware.com
//
'use strict';

const Promise = require('bluebird');
const winston = require('winston');

module.exports = function (config) {
  return new Promise(async (resolve, reject) => {
    try {
      winston.info('[POOL] starting %s pool..', config.name);
      let stratum = require('stratum/stratum')();

      return resolve();
    } catch (err) {
      return reject(err);
    }
  });
};
