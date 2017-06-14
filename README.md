# hypeengine

dev: &nbsp; &nbsp; &nbsp; &nbsp;[![js-semistandard-style](https://img.shields.io/badge/code%20style-semistandard-brightgreen.svg?style=flat-square)](https://github.com/Flet/semistandard) [![CircleCI](https://circleci.com/gh/bonesoul/hypeengine/tree/develop.svg?style=svg&circle-token=926a8d7960f4626cc748baa0ac647a7e13c7ea8d)](https://circleci.com/gh/bonesoul/hypeengine/tree/develop)

hypeengine is the next-gen successor of [CoiniumServ](https://github.com/bonesoul/coiniumserv). Extending the outstanding features of CoiniumServ, hypeengine will support the modern needs for crypto-currency mining.

### requirements
- node.js 8.1.1+

#### osx / linux / \*nix
- OpenSSL

#### windows
* [windows build tools](https://github.com/felixrieseberg/windows-build-tools)
* OpenSSL-Win64 [[#1]](http://slproweb.com/products/Win32OpenSSL.html) [[#2]](https://indy.fulgan.com/SSL/) (extract to `C:\OpenSSL-Win64\`)

### install
- `npm install --global --production windows-build-tools` (windows only)
- `git clone git@github.com:bonesoul/hypeengine.git`
- `cd hypeengine`
- `npm install -g grunt-cli && npm install`

### running

#### pm2 (production)

- `npm install -g pm2`
- `pm2 start src/server.js`

#### nodemon (development)

- `npm install -g nodemon`
- `nodemon`

### donate

want to support development?

* BTC: 1Nejk7qUKZAaHfwqjFx5vTtRmPVM9KaoCz
* ETH: 0x61aa3e0709e20bcb4aedc2607d4070f1db72e69b
* LTC: Ld8cy4ucf3FYThtfTnRQFFp5MKK9rZHjNg

## About
- **Platform agnostic**; hypeengine does not dictate platforms and can run on anything including Windows, Linux, MacOS -- basically where node.js can so.
- **High Performance**; Designed to be fast & efficient, hypeengine can handle dozens of pools together.
- **Modular & Flexible**; Designed to be modular since day one so that you can implement your very own ideas.
- **Free & Open-Source**; Best of all hypeengine is open source and free-to-use. You can get it running for free in minutes.
- **Easy to Setup**; We got your back covered with our guides & how-to's.

### General
- Multiple pools & ports.
- Multiple coin daemon connections.
- Supports POW (proof-of-work) coins.

### Algorithms
Scrypt, more soon..

**Features**
- Stratum protocol support.
- show_message support.
- block template support.
- generation transaction support.
- transaction message (txMessage) support.

### Storage Layers
- mongodb

### Web
- Embedded web-server.
- Full stack json-api.

### Addititional Features
- ✔ Vardiff support
- ✔ Ban manager (that can handle miners flooding with invalid shares)
- ✔ Share, job and payment managers included.
