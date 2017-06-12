//
//     hypeengine
//     Copyright (C) 2013 - 2017, Hüseyin Uslu, Int6ware - http://www.int6ware.com
//
'use strict';

const winston = require('winston');
const events = require('events');
const Server = require('stratum/server');
const Daemon = require('daemon/daemon');
const errors = require('daemon/errors');
const utils = require('common/utils.js');

var pool = module.exports = function (config) {
  var _this = this;
  winston.info('[POOL] starting %s pool..', config.name);

  _this.context = {
    config: config,
    coin: {
      capatabilities: {
        submitBlockSupported: null
      }
    },
    network: {
      difficulty: null
    },
    wallet: {
      central: null
    }
  };

  startup();

  async function startup() {
    _this.context.daemon = await setupDaemon(_this.context.config.daemon); // start daemon connection.
    _this.context.coin.capatabilities.submitBlockSupported = await detectSubmitBlock(); // get coin capatabilities.
    _this.context.wallet.central = await validatePoolAddress();

    console.dir(_this.context);

    winston.info('[COIN] submitblock: %s, difficulty: %d', _this.context.coin.capatabilities.submitBlockSupported, _this.context.network.difficulty);
    //let stratum = new Server(context);
  };

  // starts up the daemon connection
  function setupDaemon() {
    return new Promise(async (resolve, reject) => {
      try {
        if (typeof (_this.context.config) == 'undefined') {
          // make sure we have been supplied a daemon configuration.
          return reject('No coin daemons have been configured. Pool initialization failed..')
        }

        let daemon = new Daemon(_this.context.config.daemon);

        // wait until daemon interface reports that we are online (got connected to daemon succesfully).
        daemon.once('online', function () {
          return resolve(daemon);
        });
      } catch (err) {
        return reject(err);
      }
    });
  };

  // detects if the coin supports submitblock() call.
  function detectSubmitBlock() {
    return new Promise(async (resolve, reject) => {
      try {
        // issue a submitblock() call too see if it's supported.
        _this.context.daemon.cmd('submitblock', ['invalid-hash'], function (error, response) {
          // If the coin supports the submitblock() call it's should return a DESERIALIZATION_ERROR (-22) - 'Block decode failed'
          // Otherwise if it doesn't support the call, it should return a METHOD_NOT_FOUND(-32601) - 'Method not found' error.
          if (error.code === errors.Rpc.DESERIALIZATION_ERROR) // the coin supports submitblock().
            return resolve(true);
          else if (error.code === errors.Rpc.METHOD_NOT_FOUND) // the coin doesn't have submitblock() method.
            return resolve(false);
        });
      } catch (err) {
        return reject(err);
      }
    });
  };

  // validates the configured pool address for recieving mined blocks.
  function validatePoolAddress() {
    return new Promise(async (resolve, reject) => {
      try {
        _this.context.daemon.cmd('validateaddress', [_this.context.config.wallet.address], function (error, response) {
          let result = response.result;

          if (response.error)
            return reject(`Pool initilization failed as rpc call validateaddress() call failed: ${response.error.message}`);

          // make sure configured address is valid.
          if (!result.isvalid || !result.ismine)
            return reject(`Pool initilization failed as configured pool address '${_this.context.config.wallet.address}' is not owned by the connected wallet.`);

          // get the script for the pool address.
          result.script = utils.addressToScript(result.address); // pure pow coins just use the address within the coinbase transaction.

          return resolve(result);
        });
      } catch (err) {
        return reject(err);
      }
    });
  }
};


// detect coin features.
/*function checkCoinFeatures(daemon) {
  return new Promise(async (resolve, reject) => {
    try {
      // Use getdifficulty() to determine if we are connected to POS + POW hybrid coin.
      daemon.cmd('getdifficulty', [], function (error, response) {
        if (error) return reject(error);
        return resolve(response.result);
      });
    } catch (err) {
      return reject(err);
    }
  });
};*/

pool.prototype.__proto__ = events.EventEmitter.prototype;
