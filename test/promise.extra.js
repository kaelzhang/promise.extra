import test from 'ava'

import {
  series,
  waterfall
} from '..'


test.cb('series: normal', t => {
  const array = [1, 2, 3, 4, 5]
  series(
    array.map((x) => {
      return () => {
        return Promise.resolve(x)
      }
    })
  )
  .then((results) => {
    t.deepEqual(results, array)
    t.end()
  })
  .catch((err) => {
    t.fail()
    t.end()
  })
})


test.cb('series: normal with args', t => {
  const array = [1, 2, 3, 4, 5]
  series(
    array.map((x) => {
      return (a, b) => {
        return Promise.resolve(x + a + b)
      }
    }), 1, 2
  )
  .then((results) => {
    t.deepEqual(results, array.map(x => x + 3))
    t.end()
  })
  .catch((err) => {
    t.fail()
    t.end()
  })
})


test.cb('series: should reject when any error occurs', t => {
  const array = [1, 2, 3, 4, 5]
  series(
    array.map((x, i) => {
      return () => {
        if (i === 2) {
          return Promise.reject(x)
        }
        return Promise.resolve(x)
      }
    })
  )
  .then((results) => {
    t.fail()
    t.end()
  })
  .catch((error) => {
    t.is(error, 3)
    t.end()
  })
})


test.cb('waterfall: normal', t => {
  const array = [1, 2, 3, 4, 5]
  waterfall(
    array.map((x, i) => {
      return (n) => {
        return Promise.resolve(n + x)
      }
    }),
    1
  )
  .then((result) => {
    t.is(result, 16)
    t.end()
  })
  .catch((error) => {
    t.is(error, 3)
    t.end()
  })
})


test.cb('waterfall: normal', t => {
  const array = [1, 2, 3, 4, 5]
  waterfall(
    array.map((x, i) => {
      return (n, a, b) => {
        return Promise.resolve(n + x + a + b)
      }
    }),
    1, 2, 3
  )
  .then((result) => {
    t.is(result, 16 + 5 * 5)
    t.end()
  })
  .catch((error) => {
    t.is(error, 3)
    t.end()
  })
})
