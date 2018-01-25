import test from 'ava'
import FakePromise from 'promise-faker'

import {
  series,
  waterfall,
  factory
} from '../src'

test('series: tasks which return no promises', t => {
  const array = [1, 2, 3, 4, 5]

  return series(array.map(x => () => x))
  .then(result => {
    t.deepEqual(result, array)
  })
})

test('series: normal', t => {
  const array = [1, 2, 3, 4, 5]
  return series(
    array.map((x) => {
      return () => {
        return Promise.resolve(x)
      }
    })
  )
  .then((results) => {
    t.deepEqual(results, array)
  })
})

test('series: normal with args', t => {
  const array = [1, 2, 3, 4, 5]
  return series(
    array.map((x) => {
      return (a, b) => {
        return Promise.resolve(x + a + b)
      }
    }),
    factory => factory(1, 2)
  )
  .then((results) => {
    t.deepEqual(results, array.map(x => x + 3))
  })
})

test('series: normal with args and this', t => {
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
  .then((results) => {
    t.deepEqual(results, array.map(x => x + 3 + 1))
  })
})

test('series: should reject when any error occurs', t => {
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
  .then(
    results => t.fail(),
    error => t.is(error, 3)
  )
})

test('waterfall: normal', t => {
  const array = [1, 2, 3, 4, 5]
  return waterfall(
    array.map((x, i) => {
      return (n) => {
        return Promise.resolve(n + x)
      }
    }),
    1
  )
  .then((result) => {
    t.is(result, 16)
  })
})

test('waterfall: factories return no promises', t => {
  const array = [1, 2, 3, 4, 5]
  return waterfall(
    array.map((x, i) => {
      return (n) => {
        return n + x
      }
    }),
    1
  )
  .then((result) => {
    t.is(result, 16)
  })
})

test('waterfall: normal with args', t => {
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
  .then((result) => {
    t.is(result, 16 + 5 * 5)
  })
})


test('waterfall: normal with args and this', t => {
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
  .then((result) => {
    t.is(result, 16 + 5 * 5 + 5)
  })
})

test('with FakePromise', async t => {
  const {
    series
  } = factory(FakePromise)

  const tasks = [1, 2, 3]

  const a = series(tasks.map(x => () => x))
  t.deepEqual(FakePromise.resolve(a, true), tasks)
})

test('series: runner with throw', async t => {
  return series([
    () => {
      throw 'a'
    }
  ])
  .then(() => {
    t.fail('should fail')
  }, err => {
    t.is(err, 'a')
  })
})

test('waterfall: runner with throw', async t => {
  return waterfall([
    () => {
      throw 'a'
    }
  ])
  .then(() => {
    t.fail('should fail')
  }, err => {
    t.is(err, 'a')
  })
})

test('series: task with empty item', async t => {
  return series([
    () => 1,
    ,
    () => 2
  ])
  .then(result => {
    t.deepEqual(result, [1,,2])
  })
})
