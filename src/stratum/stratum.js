//
//     hypeengine
//     Copyright (C) 2013 - 2017, Hüseyin Uslu, Int6ware - http://www.int6ware.com
//
'use strict';

const winston = require('winston');
const net = require('net');
const client = require('stratum/client');

let workers = {};

module.exports = function (context) {

  // create the tcp server for stratum+tp:// connections
  let server = net.createServer({ allowHalfOpen: false }, function (socket) {
      handleConnection(socket); // handle the new connection
  });

  server.maxConnections = 1000000;  // set max connections to as much as possible.

  // start listening for connections
  server.listen(context.config.stratum.port, function () {
      winston.log('info', '[STRATUM] listening on %s:%d', server.address().address, server.address().port);
  })
  .on('error', function (err) {
        if (err.code == 'EADDRINUSE')
          winston.error('Can not listen on port %d as it\'s already in use, retrying..', context.config.stratum.port);
        else
          winston.error('Can not listen for stratum; %s', err)
    });
};

// Handles incoming connections
function handleConnection(socket) {
  winston.debug('[STRATUM] client connected %s:%d', socket.remoteAddress, socket.remotePort);

  socket.setKeepAlive(true); // set keep-alive on as we want a continous connection.

  let worker = new client({
    socket: socket, // assigned socket to client's connection.
  });
}
