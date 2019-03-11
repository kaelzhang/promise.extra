import test from 'ava'
import FakePromise from 'promise-faker'
import Bluebird from 'bluebird'

import {
  factory
} from '../src'

const createFactory = x => () => x
const createPromiseFactory = p => x => () => p.resolve(x)

function factoryReducer (prev, factory) {
  return factory.call(this, prev)
}

const FACTORY_CASES = [
  {
    d: 'reduce: empty task',
    type: 'reduce',
    run (reduce) {
      return reduce([], x => x, 1)
    },
    result: 1
  },

  {
    d: 'series: tasks which return no promises',
    type: 'series',
    run (series, Promise, reducer) {
      const array = [1, 2, 3, 4, 5]
      return series(array.map(createFactory), reducer)
    },
    result: [1, 2, 3, 4, 5]
  },

  {
    d: 'series: normal',
    type: 'series',
    run (series, Promise, reducer) {
      const array = [1, 2, 3, 4, 5]
      return series(
        array.map(createPromiseFactory(Promise)),
        reducer
      )
    },

    result: [1, 2, 3, 4, 5]
  },

  {
    d: 'series: normal with args',
    type: 'series',
    run (series, Promise) {
      const array = [1, 2, 3, 4, 5]
      return series(
        array.map((x) => {
          return (a, b) => {
            return Promise.resolve(x + a + b)
          }
        }),
        (prev, factory) => factory(1, 2)
      )
    },
    result: [1, 2, 3, 4, 5].map(x => x + 3)
  },

  {
    d: 'series: normal, with reducer, args and this',
    type: 'series',
    run (series, Promise) {
      const array = [1, 2, 3, 4, 5]

      return series.call(
        {
          a: 1
        },
        array.map((x) => {
          return function (a, b) {
            return Promise.resolve(this.a + x + a + b)
          }
        }),
        function (prev, factory) {
          return factory.call(this, 1, 2)
        }
      )
    },
    result: [1, 2, 3, 4, 5].map(x => x + 3 + 1)
  },

  {
    d: 'series: should reject when any error occurs',
    type: 'series',
    run (series, Promise, reducer) {
      const array = [1, 2, 3, 4, 5]
      return series(
        array.map((x, i) => {
          return () => {
            if (i === 2) {
              return Promise.reject(x)
            }
            return Promise.resolve(x)
          }
        }),
        reducer
      )
    },
    error (t, error) {
      t.is(error, 3)
    }
  },

  {
    d: 'waterfall: normal',
    type: 'waterfall',
    run (waterfall, Promise, reducer) {
      const array = [1, 2, 3, 4, 5]
      return waterfall(
        array.map((x, i) => {
          return (n) => {
            return Promise.resolve(n + x)
          }
        }),
        1,
        reducer
      )
    },
    result: 16
  },

  {
    d: 'waterfall: factories return no promises',
    type: 'waterfall',
    run (waterfall, Promise, reducer) {
      const array = [1, 2, 3, 4, 5]
      return waterfall(
        array.map((x, i) => {
          return (n) => {
            return n + x
          }
        }),
        1,
        reducer
      )
    },
    result: 16
  },

  {
    d: 'waterfall: normal with args',
    type: 'waterfall',
    run (waterfall, Promise) {
      const array = [1, 2, 3, 4, 5]
      return waterfall(
        array.map((x, i) => {
          return (n, a, b) => {
            return Promise.resolve(n + x + a + b)
          }
        }),
        1,
        (prev, factory) => factory(prev, 2, 3)
      )
    },
    result: 16 + 5 * 5
  },

  {
    d: 'waterfall: normal with args and this',
    type: 'waterfall',
    run (waterfall, Promise) {
      const array = [1, 2, 3, 4, 5]
      return waterfall.call(
        {
          a: 1
        },
        array.map((x, i) => {
          return function (n, a, b) {
            return Promise.resolve(this.a + n + x + a + b)
          }
        }),
        1,
        function (prev, factory) {
          return factory.call(this, prev, 2, 3)
        }
      )
    },
    result: 16 + 5 * 5 + 5
  },

  {
    d: 'series: reducer with throw',
    type: 'series',
    run (series, Promise, reducer) {
      return series([
        () => {
          throw 'a'
        }
      ], reducer)
    },
    error (t, err) {
      t.is(err, 'a')
    }
  },

  {
    d: 'waterfall: reducer with throw',
    type: 'waterfall',
    run (waterfall, Promise, reducer) {
      return waterfall([
        () => {
          throw 'a'
        }
      ], undefined, reducer)
    },
    error (t, err) {
      t.is(err, 'a')
    }
  },

  {
    d: 'series: task with empty item',
    type: 'series',
    run (series, Promise, reducer) {
      return series([
        () => 1,
        ,
        () => 2
      ], reducer)
    },
    result: [1,,2]
  },

  {
    d: 'some: no promises with boolean',
    type: 'some',
    run (some, Promise, reducer) {
      return some([false, false, true].map(createFactory), reducer)
    },
    result: true
  },

  {
    d: 'some: no',
    type: 'some',
    run (some, Promise, reducer) {
      return some([false, false, false].map(createFactory), reducer)
    },
    result: false
  },

  {
    d: 'some: promises with boolean',
    type: 'some',
    run (some, Promise, reducer) {
      return some(
        [false, false, true].map(createPromiseFactory(Promise)),
        reducer
      )
    },
    result: true
  },

  {
    d: 'some: should skip factory after true',
    type: 'some',
    run (some, Promise, reducer) {
      const tasks = [false, false, true].map(createFactory)
      return some([...tasks, () => {
        throw 'a'
      }], reducer)
    },
    result: true
  },

  {
    d: 'some: should skip promise factory after true',
    type: 'some',
    run (some, Promise, reducer) {
      const tasks = [false, false, true].map(createPromiseFactory(Promise))
      return some([...tasks, () => {
        return Promise.reject('a')
      }], reducer)
    },
    result: true
  },

  {
    d: 'some: throw',
    type: 'some',
    run (some, Promise, reducer) {
      const tasks = [false, false, true].map(createPromiseFactory(Promise))
      return some([() => {
        return Promise.reject('a')
      }, ...tasks], reducer)
    },
    error (t, err) {
      t.is(err, 'a')
    }
  },

  {
    d: 'findIndex: normal matcher',
    type: 'findIndex',
    run (findIndex, Promise, reducer) {
      const list = [1, 2, 3].map(createPromiseFactory(Promise))
      return findIndex(list, v => v === 2, reducer)
    },
    result: 1
  },

  {
    d: 'findIndex: empty task',
    type: 'findIndex',
    run (findIndex, Promise, reducer) {
      return findIndex([], v => v === 2, reducer)
    },
    result: -1
  },

  {
    d: 'indexOf: found',
    type: 'indexOf',
    run (indexOf, Promise, reducer) {
      const list = [1, 2, 3].map(createPromiseFactory(Promise))
      return indexOf(list, 2, reducer)
    },
    result: 1
  },

  {
    d: 'indexOf: not found',
    type: 'indexOf',
    run (indexOf, Promise, reducer) {
      const list = [1, 2, 3].map(createPromiseFactory(Promise))
      return indexOf(list, 4, reducer)
    },
    result: -1
  },

  {
    d: 'findIndex: promise matcher',
    type: 'findIndex',
    run (findIndex, Promise, reducer) {
      const list = [1, 2, 3].map(createPromiseFactory(Promise))
      return findIndex(list, v => Promise.resolve(v === 2), reducer)
    },
    result: 1
  },

  {
    d: 'every: no',
    type: 'every',
    run (every, Promise, reducer) {
      return every([true, true, false].map(createFactory), reducer)
    },
    result: false
  },

  {
    d: 'every: yes',
    type: 'every',
    run (every, Promise, reducer) {
      return every([true, true, true].map(createFactory), reducer)
    },
    result: true
  },

  {
    d: 'find: found',
    type: 'find',
    run (find, Promise, reducer) {
      return find([1, 2, 3].map(createFactory), x => x === 2, reducer)
    },
    result: 2
  },

  {
    d: 'find: not found',
    type: 'find',
    run (find, Promise, reducer) {
      return find([1, 2, 3].map(createFactory), x => x === 5, reducer)
    },
    result: undefined
  },
]

FACTORY_CASES.forEach(c => {
  c.reducer = factoryReducer
})

const CASES = [
  ...FACTORY_CASES,
  {
    d: 'series: default reducer',
    type: 'series',
    run (series) {
      return series([1, 2, 3])
    },
    result: [1, 2, 3]
  },

  {
    d: 'find: with reducer',
    type: 'find',
    run (find, Promise) {
      return find([1, 2, 3], v => v === 5, (prev, v) => Promise.resolve(v + 2))
    },
    result: 5
  },

  {
    d: 'find: promise matcher',
    type: 'find',
    run (find, Promise) {
      return find([1, 2, 3], v => Promise.resolve(v).then(v => v === 2))
    },
    result: 2
  }
]

const getTest = only => only
  ? test.only
  : test

const go = (p, pname, teardown) => {
  const extra = factory(p)

  CASES.forEach(({
    d,
    type,
    run,
    result,
    error,
    reducer,
    only
  }) => {

    getTest(only)(`${pname}: ${d}`, t => {
      const method = extra[type]
      return teardown(
        () => run(method, p, reducer),
        r => {
          if (error) {
            t.fail('should fail')
            return
          }

          if (Object(result) === result) {
            t.deepEqual(r, result, 'result not deep equal')
            return
          }

          t.is(r, result, 'result not equal')
        },

        err => {
          if (!error) {
            console.log(err)
            t.fail('should not fail')
            return
          }

          if (typeof error === 'string') {
            t.is(err.message, error, 'error message not match')
            return
          }

          error(t, err)
        }
      )
    })
  })
}

const promiseDeardown = (promise, then, error) => {
  return promise().then(then, error)
}

go(Promise, 'vanilla promise', promiseDeardown)
go(Bluebird, 'bluebird', promiseDeardown)

go(FakePromise, 'promise-faker', (promise, then, error) => {
  let result

  try {
    result = FakePromise.resolve(promise(), true)
  } catch (err) {
    error(err)
    return
  }

  then(result)
})
