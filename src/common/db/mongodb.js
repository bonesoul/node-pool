//
//     hypeserv
//     Copyright (C) 2013 - 2017, Hüseyin Uslu, Int6ware - http://www.int6ware.com
//
'use strict';

const Promise = require('bluebird');
const winston = require('winston');
const mongoose = require('mongoose');
const path = require('path');
const config = require('config');
const glob = require('glob-promise');
const forEach = require('lodash/forEach');

function load () {
  return new Promise(async (resolve, reject) => {
    try {
      mongoose.Promise = require('bluebird'); // let mongoose use bluebird.
      const db = `mongodb://${config.get('database.mongodb.host')}/${config.get('database.mongodb.name')}`;

      winston.log('info', '[DB] initializing mongodb connection:', db);

      // set the connection options
      const options = { server: { socketOptions: { keepAlive: 1 } } };

      mongoose.connect(db, options);

      // TODO: let winston log the events
      mongoose.connection.on('error', console.log); // eslint-disable-line no-console
      mongoose.connection.on('disconnected', console.log); // eslint-disable-line no-console

      // enable logging collection methods + arguments to the console
      mongoose.set('debug', config.get('database.mongodb.debug'));

      winston.info('[DB] bootstrapping the mongo models..');

      // find all available models and bootstrap them.
      let files = await glob('src/models/**/*.js');
      winston.info('[DB] loading %d mongo models.', files.length);

      // loop through all available models files.
      forEach(files, function (model) {
        require(path.join(__dirname, '../../../', model));
      });

      winston.info('[DB] mongo database initialization complete..');
      return resolve();
    } catch (err) {
      return reject(err);
    }
  });
}

module.exports = exports = load;
