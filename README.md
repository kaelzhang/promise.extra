[![Build Status](https://travis-ci.org/kaelzhang/promise.extra.svg?branch=master)](https://travis-ci.org/kaelzhang/promise.extra)
<!-- optional appveyor tst
[![Windows Build Status](https://ci.appveyor.com/api/projects/status/github/kaelzhang/promise.extra?branch=master&svg=true)](https://ci.appveyor.com/project/kaelzhang/promise.extra)
-->
<!-- optional npm version
[![NPM version](https://badge.fury.io/js/promise.extra.svg)](http://badge.fury.io/js/promise.extra)
-->
<!-- optional npm downloads
[![npm module downloads per month](http://img.shields.io/npm/dm/promise.extra.svg)](https://www.npmjs.org/package/promise.extra)
-->
<!-- optional dependency status
[![Dependency Status](https://david-dm.org/kaelzhang/promise.extra.svg)](https://david-dm.org/kaelzhang/promise.extra)
-->

# promise.extra

Promise.series and Promise.waterfall with vanilla es promise

## Install

```sh
$ npm install promise.extra --save
```

## Usage

```js
import {
  series,
  waterfall
} from 'promise.extra'

// Unlike `Promise.all`, `series` receives an array of factory functions instead of `Promise`'s.
series([f1, f2, f3]).then(values => {
  console.log(values)
})

waterfall([f1, f2, f3], initValue).then(result => {
  console.log(result)
})
```

## series(tasks)

- **tasks** `Array.<PromiseFactory>` an array of functions each of which returns a `Promise`
- **PromiseFactory** `function() : Promise` a factory function which returns a `Promise`

Returns `Promise`

## waterfall(tasks [, initValue])

- **tasks** `Array.<PromiseFactory>`
- **PromiseFactory** `function(x) : Promise` a factory function which receives a parameter and returns a `Promise`
- **initValue** `any=` optional initial value which will be passed into the first factory function.

Returns a `Promise`.

## License

MIT
