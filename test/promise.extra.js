import test from 'ava'
import FakePromise from 'promise-faker'
import Bluebird from 'bluebird'

import {
  factory
} from '../src'

const CASES = [
  {
    d: 'series: tasks which return no promises',
    type: 'series',
    run (series) {
      const array = [1, 2, 3, 4, 5]
      return series(array.map(x => () => x))
    },
    result: [1, 2, 3, 4, 5]
  },

  {
    d: 'series: normal',
    type: 'series',
    run (series, Promise) {
      const array = [1, 2, 3, 4, 5]
      return series(
        array.map((x) => {
          return () => {
            return Promise.resolve(x)
          }
        })
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
        factory => factory(1, 2)
      )
    },
    result: [1, 2, 3, 4, 5].map(x => x + 3)
  },

  {
    d: 'series: normal with args and this',
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
        function (factory) {
          return factory.call(this, 1, 2)
        }
      )
    },
    result: [1, 2, 3, 4, 5].map(x => x + 3 + 1)
  },

  {
    d: 'series: should reject when any error occurs',
    type: 'series',
    run (series, Promise) {
      const array = [1, 2, 3, 4, 5]
      return series(
        array.map((x, i) => {
          return () => {
            if (i === 2) {
              return Promise.reject(x)
            }
            return Promise.resolve(x)
          }
        })
      )
    },
    error (t, error) {
      t.is(error, 3)
    }
  },

  {
    d: 'waterfall: normal',
    type: 'waterfall',
    run (waterfall, Promise) {
      const array = [1, 2, 3, 4, 5]
      return waterfall(
        array.map((x, i) => {
          return (n) => {
            return Promise.resolve(n + x)
          }
        }),
        1
      )
    },
    result: 16
  },

  {
    d: 'waterfall: factories return no promises',
    type: 'waterfall',
    run (waterfall) {
      const array = [1, 2, 3, 4, 5]
      return waterfall(
        array.map((x, i) => {
          return (n) => {
            return n + x
          }
        }),
        1
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
    d: 'series: runner with throw',
    type: 'series',
    run (series) {
      return series([
        () => {
          throw 'a'
        }
      ])
    },
    error (t, err) {
      t.is(err, 'a')
    }
  },

  {
    d: 'waterfall: runner with throw',
    type: 'waterfall',
    run (waterfall) {
      return waterfall([
        () => {
          throw 'a'
        }
      ])
    },
    error (t, err) {
      t.is(err, 'a')
    }
  },

  {
    d: 'series: task with empty item',
    type: 'series',
    run (series) {
      return series([
        () => 1,
        ,
        () => 2
      ])
    },
    result: [1,,2]
  },

  // {
  //   d: ,
  //   type: '',
  //   run () {

  //   },
  //   result:
  // },
]

const go = (p, pname, teardown) => {
  const extra = factory(p)

  CASES.forEach(({
    d,
    type,
    run,
    result,
    error
  }) => {

    test(`${pname}: ${d}`, t => {
      const method = extra[type]
      return teardown(
        run(method, p),
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
  return promise.then(then, error)
}

go(Promise, 'vanilla promise', promiseDeardown)
go(Bluebird, 'bluebird', promiseDeardown)

go(FakePromise, 'promise-faker', (promise, then, error) => {
  let result

  try {
    result = FakePromise.resolve(promise, true)
  } catch (err) {
    error(err)
    return
  }

  then(result)
})
