//
//     hypeengine
//     Copyright (C) 2013 - 2017, Hüseyin Uslu, Int6ware - http://www.int6ware.com
//
'use strict';

var events = require('events');
var winston = require('winston');

var client = module.exports = function (options) {
  var _this = this;

  _this.lastActivity = Date.now(); // last activity by the client.
  _this.difficulty = 16;
  _this.authorized = false;
  _this.subscribed = false;
  _this.workerName = null;
  _this.workerPassword = null;
  _this.extraNonce1 = null; // extraNonce1 for the client.

  // number of shares submissions by the client - used by ban manager to evaluate a ban.
  _this.shares = {
      valid: 0, // valid shares counter
      invalid: 0 // invalid shares counter.
  };

  _this.socket = options.socket;
  setup();

  function setup() {
    _this.socket.setEncoding('utf8'); // set the encoding.
    var buffer = ''; // our data buffer.

    _this.socket.on('data', function (data) { // data recieve event
      buffer += data;

      // check for flooded socket - only allow a maximum of 10 KB of data.
      if (Buffer.byteLength(buffer, 'utf8') > 10240) {
          buffer = '';
          _this.emit('socket.flooded');
          socket.destroy();
          return;
      }

      // check for a new message
      if (buffer.indexOf('\n') !== -1) {
        var messages = buffer.split('\n'); // get the messages.
        var incomplete = buffer.slice(-1) === '\n' ? '' : messages.pop(); // make sure to keep existing incomplete message if any.

         messages.forEach(function (message) {
           if (message === '') return; // skip empty lines

            // try to parse the message as json.
            var json;

            try {
              json = JSON.parse(message);
            } catch (e) {
              /* destroy connections that submit messages we can't handle */
              _this.emit('protocol.error', message);
              socket.destroy();
              return;
            }

            // if we do have a valid json message
            if (json) {
                handleMessage(json);
            }
         });

         buffer = incomplete; // keep the incomplete data in buffer.
      }
    })
    .on('close', function () {
        _this.emit('socket.disconnect');
    })
    .on('error', function (err) {
        if (err.code !== 'ECONNRESET') _this.emit('socket.error', err);
    });
  };

  // Handles json-rpc messages from the client
  function handleMessage(message) {
    console.dir(message);
  };
};

client.prototype.__proto__ = events.EventEmitter.prototype;
