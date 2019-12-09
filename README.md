# RIF Storage.js

[![CircleCI](https://flat.badgen.net/circleci/github/rsksmart/rif-storage-js)](https://circleci.com/gh/rsksmart/rif-storage-js/)
[![codecov](https://codecov.io/gh/rsksmart/rif-storage-js/master/graph/badge.svg)](https://codecov.io/gh/rsksmart/rif-storage-js) 
[![Dependency Status](https://david-dm.org/rsksmart/rif-storage-js.svg?style=flat-square)](https://david-dm.org/rsksmart/rif-storage-js)
[![](https://img.shields.io/badge/made%20by-IOVLabs-blue.svg?style=flat-square)](http://iovlabs.org)
[![](https://img.shields.io/badge/project-RIF%20Storage-blue.svg?style=flat-square)](https://www.rifos.org/)
[![standard-readme compliant](https://img.shields.io/badge/standard--readme-OK-brightgreen.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)
[![Managed by tAsEgir](https://img.shields.io/badge/%20managed%20by-tasegir-brightgreen?style=flat-square)](https://github.com/auhau/tasegir)
![](https://img.shields.io/badge/npm-%3E%3D6.0.0-orange.svg?style=flat-square)
![](https://img.shields.io/badge/Node.js-%3E%3D10.0.0-orange.svg?style=flat-square)
![](https://img.shields.io/badge/runs%20in-browser%20%7C%20node%20%7C%20webworker%20%7C%20electron-orange)

> Client library integrating distributed storage projects  

## Table of Contents

- [Install](#install)
  - [npm](#npm)
  - [Use in Node.js](#use-in-nodejs)
  - [Use in a browser with browserify, webpack or any other bundler](#use-in-a-browser-with-browserify-webpack-or-any-other-bundler)
  - [Use in a browser Using a script tag](#use-in-a-browser-using-a-script-tag)
- [Usage](#usage)
- [API](#api)
- [CLI](#cli)
- [Contribute](#contribute)
- [License](#license)

## Install

### npm

```sh
> npm install rif-storage
```

### Use in Node.js

```js
var RifStorage = require('rif-storage')
```

### Use in a browser with browserify, webpack or any other bundler

```js
var RifStorage = require('rif-storage')
```

### Use in a browser Using a script tag

Loading this module through a script tag will make the `RifStorage` obj available in the global namespace.

```html
<script src="https://unpkg.com/rif-storage/dist/index.min.js"></script>
<!-- OR -->
<script src="https://unpkg.com/rif-storage/dist/index.js"></script>
```

## Usage

This is a client library, therefore you need to provide access to the provider's running node for specifics see [Providers](#providers).

```javascript
import RifStorage, { Provider } from 'rif-storage'

// Connects to locally running node
const storage = RifStorage(Provider.IPFS, { host: 'localhost', port: '5001', protocol: 'http' })

const fileHash = await storage.put(Buffer.from('hello world!'))
const retrievedData = await storage.get(fileHash) // Returns Buffer
console.log(retrievedData.toString()) // prints 'hello world!'

const directory = {
  'file': { data: Buffer.from('nice essay')},
  'other-file': { data: Buffer.from('nice essay')},
  'folder/with-file': { data: Buffer.from('nice essay')},
  'folder/with-other-folder/and-file': { data: Buffer.from('nice essay')}
}
const rootHash = await storage.put(directory)
const retrievedDirectory = await storage.get(rootHash)
```

### Manager

This tool ships with utility class `Manager` that that supports easy usage of multiple providers in your applications.
It allows registration of all supported providers and then easy putting/getting data with
the same interface as providers.

```javascript
import { Manager, Provider } from 'rif-storage'

const storage = new Manager()

// The first added provider becomes also the active one
storage.addProvider(Provider.IPFS, { host: 'localhost', port: '5001', protocol: 'http' })
storage.addProvider(Provider.SWARM, { url: 'http://localhost:8500' })

const ipfsHash = await storage.put(Buffer.from('hello ipfs!')) // Stored to IPFS

storage.makeActive(Provider.SWARM)
const swarmHash = await storage.put(Buffer.from('hello swarm!')) // Stored to Swarm

console.log(storage.get(ipfsHash)) // Retrieves data from IPFS and prints 'hello ipfs!'
console.log(storage.get(swarmHash)) // Retrieves data from Swarm and prints 'hello swarm!'
```

## Providers

This library integrates several (decentralized) storage providers, currently supported is:
 
 - [IPFS](https://ipfs.io/) using [js-ipfs-http-client]
 - [Swarm](http://swarm-guide.readthedocs.io/) using [Erebos] library

### IPFS

 > in-browser node ✅ 

```javascript
RifStorage(Provider.IPFS, ipfsOptions)
```

`ipfsOptions` are directly passed to [js-ipfs-http-client], hence check that for syntax and options.

You can run a node directly in browser using [js-ipfs]. Just create instance and pass it instance instead of `ipfsOption`.

### Swarm

 > in-browser node ❌ 

```javascript
RifStorage(Provider.SWARM, swarmOptions)
```

`swarmOptions` are directly passed to [Erebos], hence check that for syntax and options.

## API

TBD

## Contribute

There are some ways you can make this module better:

- Consult our [open issues](https://github.com/rsksmart/rif-storage-js/issues) and take on one of them
- Help our tests reach 100% coverage!

## License

[MIT](./LICENSE)

[js-ipfs-http-client]: https://github.com/ipfs/js-ipfs-http-client/
[js-ipfs]: https://github.com/ipfs/js-ipfs
[Erebos]: https://erebos.js.org/docs/api-bzz
