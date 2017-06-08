//
//     hypeserv
//     Copyright (C) 2013 - 2017, Hüseyin Uslu, Int6ware - http://www.int6ware.com
//
'use strict';

const fs = require('fs');
const path = require('path');
const winston = require('winston');
const config = require('config');

module.exports = function (processName) {
  // setup the logging directory and ensure it exists.
  const logDir = path.join(__dirname, '../../../logs');
  fs.existsSync(logDir) || fs.mkdirSync(logDir);

  winston.remove(winston.transports.Console); // remove the default console log.

  if (config.get('logging.console.enabled')) { // re-setup the console log if enabled.
    winston.add(winston.transports.Console, {
      colorize: true,
      prettyPrint: true,
      timestamp: function () {
        var date = new Date();
        return `${date.getDate()}/${(date.getMonth() + 1)} ${date.toTimeString().substr(0, 8)} [${global.process.pid}]`;
      },
      level: config.get('logging.console.level')
    });
  }

  if (config.get('logging.file.enabled')) { // setup the server log if enabled.
    winston.add(winston.transports.File, {
      filename: path.join(logDir, `/${processName}.log`),
      level: config.get('logging.file.level'),
      json: false
    });
  }
};
