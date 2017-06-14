//
//     hypeengine
//     Copyright (C) 2013 - 2017, Hüseyin Uslu, Int6ware - http://www.int6ware.com
//
'use strict';

const winston = require('winston');
const events = require('events');
const http = require('http');

var daemon = module.exports = function (config) {
  var _this = this;
  _this.config = config;

  this.cmd = cmd;
  this.batch = batch;
  http.globalAgent.maxSockets = Infinity; // free the limits of http connections.

  winston.info('[DAEMON] Checking connectivity [%s:%d]..', _this.config.host, _this.config.port);

  waitDaemonConnectivity(function () {
    winston.info('[DAEMON] Connection check succesfull [%s:%d]', _this.config.host, _this.config.port);
    _this.emit('online');
  });

  function waitDaemonConnectivity (callback) {
    var retryCount = 0;

    var check = function () {
      // make sure we can connect to configured coin daemon.
      cmd('getinfo', [], function (error, response) {
        if (error !== null || response === 'undefined' || response.error) {
          // case when we can't get a response back from coin daemon.
          retryCount++;
          winston.warn('[DAEMON] Waiting for daemon [%s:%d] to come online - retry: %d', _this.config.host, _this.config.port, retryCount);
          setTimeout(check, 1000);
        } else if (response.result.connections === 0) {
          // case where coin daemon is not connected to coin network (getinfo.connections = 0)
          retryCount++;
          winston.warn('[DAEMON] Waiting for daemon [%s:%d] to get connected - retry: %d', _this.config.host, _this.config.port, retryCount);
          setTimeout(check, 1000);
        } else {
          // once we can get a reply back from coin daemon and it's connected to other peers,
          // we are ready to rock
          callback();
        }
      });
    };

    check();
  }

  function cmd (method, params, callback) {
    var request = JSON.stringify({
      method: method,
      params: params,
      id: Date.now() + Math.floor(Math.random() * 10)
    });

    makeHttpRequest(request, function (error, result) {
      callback(error, result);
    });
  }

  function batch (methods, callback) {
    var requests = [];

    for (var i = 0; i < methods.length; i++) {
      requests.push({
        method: methods[i][0],
        params: methods[i][1],
        id: Date.now() + Math.floor(Math.random() * 10) + i
      });
    }

    var json = JSON.stringify(requests);

    makeHttpRequest(json, function (error, results) {
      callback(error, results);
    });
  }

  function makeHttpRequest (requestData, callback) {
    var options = {
      hostname: (typeof (_this.config.host) === 'undefined' ? '127.0.0.1' : _this.config.host), // default to 127.0.0.1
      port: _this.config.port,
      method: 'POST',
      auth: _this.config.user + ':' + _this.config.password,
      headers: {
        'Content-Length': requestData.length
      }
    };

    var request = http.request(options, function (response) {
      var data = '';
      response.setEncoding('utf8');
      response.on('data', function (chunk) {
        data += chunk;
      });
      response.on('end', function () {
        parseResponse(response, data);
      });
    });

    request.on('error', function (e) {
      callback(e);
    });

    request.end(requestData);

    var parseResponse = function (response, responseData) {
      var json;

      // handle 401 - Unauthorized
      if (response.statusCode === 401) {
        winston.error('[DAEMON] Unauthorized RPC access - invalid RPC username or password');
        return;
      }

      try {
        json = JSON.parse(responseData);
      } catch (e) {
        winston.error('[DAEMON] Could not parse rpc data from coin daemon; \n request: ' + requestData + '\nresponse: ' + responseData);
        callback(e);
      }

      if (json) callback(json.error, json);
    };
  }
};

daemon.prototype.__proto__ = events.EventEmitter.prototype;
