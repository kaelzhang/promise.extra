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

Promise.series and Promise.waterfall with vanilla es [`Promise`](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise)/thenable

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

## series(tasks [, runner])

- **tasks** `Array<PromiseFactory>` an array of functions each of which returns a `Promise`
  - **PromiseFactory** `Function() : Promise` a factory function which returns a `Promise`
- **runner** `?Function(factory: PromiseFactory)` the runner which will process each `PromiseFactory`. The default value is:

```js
function defaultRunner (factory) {
  return factory.call(this)
}
```

Returns `Promise`

## waterfall(tasks, initValue [, runner])

- **tasks** `Array.<PromiseFactory>`
  - **PromiseFactory** `Function(x) : Promise` a factory function which receives a parameter and returns a `Promise`
- **initValue** `any` optional initial value which will be passed into the first factory function.
- **runner** `?Function(factory: PromiseFactory, prev)` The default runner is:

```js
function defaultRunner (factory, prev) {
  return factory.call(this, prev)
}
```

Returns `Promise`.

## Examples

### Usage of `runner`

```js
const nickName = 'Steve'

// Suppose there are two async functions to check the nickName
series([checkNickNameSyntax, removeCheckUnique], factory => factory(nickName))
```

### The `this` Object

```js
function lessThan10 (notThrow) {
  if (this.number < 10) {
    this.number ++
    return true
  }

  if (notThrow) {
    return false
  }

  return Promise.reject('larger than 10')
}

series.call({number: 10}, [lessThan10, lessThan10])  // Reject
series.call({number: 1}, [lessThan10, lessThan10])   // Promise.resolve<true>

series.call({number: 10}, [lessThan10, lessThan10], function (factory) {
  // 1. Be careful that you should use `factory.call` here
  //   to pass the `this` object to `factory`
  // 2. use the parameter `notThrow`
  return factory.call(this, true)
})
// Promise.resolve<false>
```

## License

MIT
