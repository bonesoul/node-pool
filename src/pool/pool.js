//
//     hypeengine
//     Copyright (C) 2013 - 2017, Hüseyin Uslu, Int6ware - http://www.int6ware.com
//
'use strict';

const winston = require('winston');
const events = require('events');
const _ = require('lodash');
const Promise = require('bluebird');
const StratumServer = require('stratum/server');
const Daemon = require('daemon/daemon');
const ShareManager = require('pool/managers/share');
const BlockManager = require('pool/managers/block');
const JobManager = require('pool/managers/job');
const errors = require('daemon/errors');
const utils = require('common/utils.js');

var pool = module.exports = function (config) {
  var _this = this;
  winston.info('[POOL] starting %s pool..', config.name);

  _this.context = {
    config: config,
    coin: {
      coinVersion: null,
      protocolVersion: null,
      walletVersion: null,
      capatabilities: {
        submitBlockSupported: null
      }
    },
    network: {
      testnet: null,
      connections: null,
      errors: null,
      difficulty: null,
      hashRate: null
    },
    wallet: {
      central: null
    },
    fees: {
      percent: 0, // total percent of pool fees.
      recipients: [] // recipients of fees.
    }
  };

  startup();

  async function startup () {
    _this.context.daemon = await setupDaemon(_this.context.config.daemon); // start daemon connection.
    _this.context.coin.capatabilities.submitBlockSupported = await detectSubmitBlock(); // get coin capatabilities.
    _this.context.wallet.central = await validatePoolAddress(); // validate central pool address.
    await readNetworkInfo(); // read network info.
    await waitBlockChainSync(); // wait for blockchain synchronization.
    await setupRecipients(); // setup pool's fee recipients.
    await startManagers(); // startup managers.
    await startStratumServer(); // startup stratum server.

    winston.info('[COIN] submitblock: %s, difficulty: %d', _this.context.coin.capatabilities.submitBlockSupported, _this.context.network.difficulty);
    winston.info('[POOL] startup done..');
  }

  // starts up the daemon connection
  function setupDaemon () {
    return new Promise(async (resolve, reject) => {
      try {
        if (typeof (_this.context.config) === 'undefined') {
          // make sure we have been supplied a daemon configuration.
          return reject(new Error('No coin daemons have been configured. Pool initialization failed..'));
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
  }

  // detects if the coin supports submitblock() call.
  function detectSubmitBlock () {
    return new Promise(async (resolve, reject) => {
      try {
        // issue a submitblock() call too see if it's supported.
        // If the coin supports the submitblock() call it's should return a DESERIALIZATION_ERROR (-22) - 'Block decode failed'
        // Otherwise if it doesn't support the call, it should return a METHOD_NOT_FOUND(-32601) - 'Method not found' error.
        _this.context.daemon.cmd('submitblock', ['invalid-hash'], function (error, response) {
          if (error.code === errors.Rpc.DESERIALIZATION_ERROR) return resolve(true); // the coin supports submitblock().
          else if (error.code === errors.Rpc.METHOD_NOT_FOUND) return resolve(false); // the coin doesn't have submitblock() method.
        });
      } catch (err) {
        return reject(err);
      }
    });
  }

  // validates the configured pool address for recieving mined blocks.
  function validatePoolAddress () {
    return new Promise(async (resolve, reject) => {
      try {
        _this.context.daemon.cmd('validateaddress', [_this.context.config.wallet.address], function (error, response) {
          if (error) return reject(new Error(`Pool initilization failed as rpc call validateaddress() call failed: ${response.error.message}`));

          let result = response.result;

          // make sure configured address is valid.
          if (!result.isvalid || !result.ismine) return reject(new Error(`Pool initilization failed as configured pool address '${_this.context.config.wallet.address}' is not owned by the connected wallet.`));

          // get the script for the pool address.
          result.script = utils.addressToScript(result.address); // pure pow coins just use the address within the coinbase transaction.

          return resolve(result);
        });
      } catch (err) {
        return reject(err);
      }
    });
  }

  // reads coin's network information.
  function readNetworkInfo () {
    return new Promise(async (resolve, reject) => {
      try {
        let calls = [
          ['getinfo', []],
          ['getmininginfo', []]
        ];

        // make a batch call of getinfo() and getmininginfo()
        _this.context.daemon.batch(calls, function (error, responses) {
          if (error) return reject(new Error(`Error reading network info`));

          var results = [];
          responses.forEach(function (response, index) {
            var call = calls[index][0];
            if (response.error) return reject(new Error(`Pool initilization failed as rpc call '${call}' failed: ${response.error.message}`)); // catch any rpc errors.

            results[call] = response.result;
          });

          // set the data.
          _this.context.coin.coinVersion = results.getinfo.version;
          _this.context.coin.protocolVersion = results.getinfo.protocolversion;
          _this.context.coin.walletVersion = results.getinfo.walletversion;
          _this.context.network.testnet = results.getinfo.testnet;
          _this.context.network.connections = results.getinfo.connections;
          _this.context.network.errors = results.getinfo.errors;
          _this.context.network.difficulty = results.getmininginfo.difficulty;
          _this.context.network.hashRate = results.getmininginfo.networkhashps;

          return resolve();
        });
      } catch (err) {
        return reject(err);
      }
    });
  }

  // awaits for the block chain synchronization.
  function waitBlockChainSync () {
    return new Promise(async (resolve, reject) => {
      try {
        // getblocktemplate() will fail if coin daemon still sync blocks from the network.
        // we'll be using it with getinfo() and getpeerinfo() together to see if we are synced with the network.

        var recheck = function () {
          let calls = [
            ['getblocktemplate', []],
            ['getinfo', []],
            ['getpeerinfo', []]
          ];

          _this.context.daemon.batch(calls, function (error, responses) {
            if (error) return reject(new Error(`Error reading network info`));

            var results = [];
            responses.forEach(function (response, index) {
              var call = calls[index][0];
              if (response.error) return reject(new Error(`Pool initilization failed as rpc call '${call}' failed: ${response.error.message}`)); // catch any rpc errors.

              results[call] = response.result;
            });

            let synced = !results.getblocktemplate.error || results.getblocktemplate.error.code !== errors.Rpc.CLIENT_IN_INITIAL_DOWNLOAD;
            if (synced) return resolve();

            setTimeout(recheck, 5000); // re-schedule recheck().

            var blockCount = results.getinfo.blocks;
            var peers = results.getpeerinfo;
            var sorted = peers.sort(function (a, b) {
              return b.startingheight - a.startingheight;
            });

            var longestChain = sorted[0].startingheight;
            var percent = (blockCount / longestChain * 100).toFixed(2);

            winston.warn(new Error(`Waiting for block chain syncronization, downloaded ${percent}% from ${peers.length} peers.`));
          });
        };

        recheck();
      } catch (err) {
        return reject(err);
      }
    });
  }

  // reads coin's network information.
  function setupRecipients () {
    return new Promise(async (resolve, reject) => {
      try {
        _.forEach(_this.context.config.rewards, (percent, address) => {
          let recipient = {
            percent: percent / 100,
            script: utils.addressToScript(address)
          };

          _this.context.fees.recipients.push(recipient);
          _this.context.fees.percent += percent;
        });

        if (_this.context.fees.percent === 0) winston.warn('Your pool is configured with 0% fees!');

        return resolve();
      } catch (err) {
        return reject(err);
      }
    });
  }

  // start managers.
  function startManagers () {
    return new Promise(async (resolve, reject) => {
      try {
        _this.context.shareManager = new ShareManager();
        _this.context.blockManager = new BlockManager();
        _this.context.jobManager = new JobManager();
        return resolve();
      } catch (err) {
        return reject(err);
      }
    });
  }

  function startStratumServer () {
    return new Promise(async (resolve, reject) => {
      try {
        _this.context.server = new StratumServer(_this.context)
          .on('client.connected', function (client) {
            winston.info('client connected');
          })
          .on('server.started', function () {
            return resolve();
          });
      } catch (err) {
        return reject(err);
      }
    });
  }
};

pool.prototype.__proto__ = events.EventEmitter.prototype;
