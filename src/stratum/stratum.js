//
//     hypeserv
//     Copyright (C) 2013 - 2017, Hüseyin Uslu, Int6ware - http://www.int6ware.com
//
'use strict';

const net = require('net');

let workers = {};

module.exports = function (context) {
  // create the tcp server for stratum+tp:// connections
  let server = net.createServer({ allowHalfOpen: false }, function (socket) {
      handleConnection(socket); // handle the new connection
  });

  server.maxConnections = 1000000;  // set max connections to as much as possible.

  // start listening for connections
  server.listen(context.config.stratum.port, function () {
      winston.log('info', 'stratum server listening on %s:%d', server.address().address, server.address().port);
      _this.emit('server.started');
  })
};
