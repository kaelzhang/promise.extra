[![Build Status](https://travis-ci.org/kaelzhang/promise.extra.svg?branch=master)](https://travis-ci.org/kaelzhang/promise.extra)
[![Coverage](https://codecov.io/gh/kaelzhang/promise.extra/branch/master/graph/badge.svg)](https://codecov.io/gh/kaelzhang/promise.extra)
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

`Promise.series` and `Promise.waterfall` with vanilla es [`Promise`](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise)/thenable

## Install

```sh
$ npm i promise.extra
```

## Usage

```js
import {
  series,
  waterfall,
  reduce,
  factory
} from 'promise.extra'

series([1, 2, 3], (prev, v) => Promise.resolve(v))
.then(values => {
  console.log(values)  // [1, 2, 3]
})

waterfall([1, 2, 3], 0, (prev, v) => Promise.resolve(prev + v))
.then(result => {
  console.log(result)  // 6
})

// The reducer could even returns non-promise values
waterfall(
  [1, 2, 3],
  0,
  (prev, v, i) => i > 0
    ? prev + v
    : Promise.resolve(prev + v)
)
.then(result => {
  console.log(result)  // 6
})

reduce([v1, v2, v3], reducer, initValue)
```

## series(tasks, reducer?)

- **tasks** `Array<Task>` an array of tasks
  - **Task** `any` each of the tasks could be anything.
- **reducer** `?ReducerFunction` the reducer which will process each `task` and returns either a `Promise` or any value.

```ts
function ReducerFunction (prev: any, task: Task, index: number, tasks): Promise | any
```

- **prev** The result value of the last task which processed by the `reducer`. If the return value of the last reducer is an `Promise`, `prev` will be the value inside the promise.
- **task** The current task.
- **index** The index of task
- **tasks** Just the `tasks` argument of function `series`

The default value of `reducer` is:

```js

(prev, currentValue) => currentValue
```

`currentValue` is one of the `Task`s, and each `Task` could be a `Promise` or a normal JavaScript variable or object.

If you want each of the `Task`s to be a factory function that returns a `Promise` or normal values, and execute each value inside the reducer, just define the reducer as:

```js
function reducer (prev, factory) {
  // If `series` is invoked by `series.call(this, ...args)`,
  // reducer could share the `this` object.
  return factory.call(this, prev)
}
```

Always returns `Promise`

## waterfall(tasks, initValue, reducer?)

- **tasks** `Array<PromiseFactory>`
  - **PromiseFactory** `Function(x): Promise` a factory function which receives a parameter and returns a `Promise`
- **initValue** `any | undefined` optional initial value which will be passed into the first factory function.
- **reducer**


Always returns `Promise`.

## reduce(tasks, reducer, initValue)

- **tasks**
- **reducer** `Function(prev, factory, currentIndex, tasks): Promise` The reducer function
- **initValue** `any | undefined` if no initial value is supplied, `undefined` will be used.

Always returns `Promise`

## findIndex(tasks, matcher, reducer?)
## find(tasks, matcher, reducer?)
## indexOf(tasks, value, reducer?)
## some(tasks, reducer?)
## every(tasks, reducer?)

Each of the methods is similar to the behavior of `Array.prototype.<method>`.

## factory(promise)

- **promise** `Promise|PromiseLike`

Creates the new `reduce`, `series`, `waterfall` with the `Promise` which can be `bluebird`, [`promise-faker`](https://github.com/kaelzhang/promise-faker) or something.

```js
import Promise from 'promise-faker'
const {
  series
} = factory(Promise)

series(tasks)
```

## Examples

### Usage of `reducer`

```js
const nickName = 'Steve'

// Suppose there are two async functions to check the nickName
series(
  [checkNickNameSyntax, removeCheckUnique],
  (prev, factory) => factory(nickName)
)
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

series.call({number: 10}, [lessThan10, lessThan10])
// Reject

series.call({number: 1}, [lessThan10, lessThan10])
// Promise.resolve<true>

series.call({number: 10},
  [lessThan10, lessThan10],
  function (prev, factory) {
    // 1. Be careful that you should use `factory.call` here
    //   to pass the `this` object to `factory`
    // 2. use the parameter `notThrow`
    return factory.call(this, true)
  }
)
// Promise.resolve<false>
```

## License

MIT
