//
//     hypeengine
//     Copyright (C) 2013 - 2017, Hüseyin Uslu, Int6ware - http://www.int6ware.com
//
'use strict';

const winston = require('winston');
const events = require('events');
const Server = require('stratum/server');

var pool = module.exports = function (config) {
  return new Promise(async (resolve, reject) => {
    try {
      winston.info('[POOL] starting %s pool..', config.name);

      let context = {
        config: config,
        coin: {}
      };

      let stratum = new Server(context);

      return resolve();
    } catch (err) {
      return reject(err);
    }
  });
};

pool.prototype.__proto__ = events.EventEmitter.prototype;
