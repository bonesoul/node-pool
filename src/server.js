//
//     hypeserv
//     Copyright (C) 2013 - 2017, Hüseyin Uslu, Int6ware - http://www.int6ware.com
//
'use strict';

require('app-module-path').addPath(__dirname);
const config = require('config');
const os = require('os');
const path = require('path');
const winston = require('winston');
const packageInfo = require('../package.json');

async function startup () {
  try {
    // ========================================
    // initialize env manager.
    // ========================================
    require('common/env.js');

    // ========================================
    // initialize log manager.
    // ========================================
    require('common/log/logger.js')('server');

    // ========================================
    // print startup banner.
    // ========================================
    winston.info('[APP] starting up hpool-server version: %s [%s]', packageInfo.version, env); // eslint-disable-line no-undef
    winston.info('[APP] running on: %s-%s [%s %s]', os.platform(), os.arch(), os.type(), os.release());
    winston.info('[APP] node: %s, v8: %s, uv: %s, openssl: %s', process.versions.node, process.versions.v8, process.versions.uv, process.versions.openssl);
    winston.info('[APP] running over %d core system', os.cpus().length);

    // ========================================
    // database manager.
    // ========================================
    await require('common/db/mongodb.js')();

    // ========================================
    // pool manager.
    // ========================================
    await require('pool/manager.js')();
  } catch (err) {
    winston.error('startup error: %s', err);
  }
}

startup();
