//
//     hypeengine
//     Copyright (C) 2013 - 2017, Hüseyin Uslu, Int6ware - http://www.int6ware.com
//
'use strict';

const _ = require('lodash');
const Promise = require('bluebird');
const winston = require('winston');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const Pool = require('pool/pool');

const pools = [];

module.exports = function () {
  return new Promise(async (resolve, reject) => {
    try {
      let configs = await discover();
      winston.info('[MANAGER] discovered %d pools..', configs.length);

      _.forEach(configs, async entry => {
        if (!entry.enabled) return;
        let pool = new Pool(entry);
        pools.push(pool);
      });

      return resolve();
    } catch (err) {
      return reject(err);
    }
  });
};

function discover () {
  return new Promise(async (resolve, reject) => {
    try {
      let poolConfigDir = 'config/pools/';
      let coinConfigDir = 'config/coins/';

      let configs = [];

      // loop through pool configuration files
      fs.readdirSync(poolConfigDir).forEach(function (entry) {
        let file = path.join(poolConfigDir, entry);

        // make sure the file exists and is a json file
        if (!fs.existsSync(file) || path.extname(file) !== '.yaml') return;

        // read the config.
        let data = yaml.safeLoad(fs.readFileSync(file, 'utf8'));

        configs.push(data);
        return resolve(configs);
      });
    } catch (err) {
      return reject(err);
    }
  });
}
