# hypeengine
hypeengine is the next-gen successor of [CoiniumServ](https://github.com/bonesoul/coiniumserv). Extending the outstanding features of CoiniumServ, hypeengine will support the modern needs for crypto-currency mining.

### requirements
* node.js 8.1.1+

#### osx / linux / \*nix
* node 8.1.1+ will be fine.

#### windows
* [windows build tools](https://github.com/felixrieseberg/windows-build-tools)
* OpenSSL-Win64 [[#1]](http://slproweb.com/products/Win32OpenSSL.html) [[#2]](https://indy.fulgan.com/SSL/) (extract to `C:\OpenSSL-Win64\`)

### install
* `git clone git@github.com:bonesoul/hypeengine.git`
* `cd hypeengine`
* `npm install -g grunt-cli && npm install`

### running

#### pm2 (production)

* `npm install -g pm2`
* `pm2 start src/server.js`

#### nodemon (development)

* `npm install -g nodemon`
* `nodemon`

### donate

want to support development?

* BTC: 1Nejk7qUKZAaHfwqjFx5vTtRmPVM9KaoCz
* ETH: 0x61aa3e0709e20bcb4aedc2607d4070f1db72e69b
* LTC: Ld8cy4ucf3FYThtfTnRQFFp5MKK9rZHjNg
