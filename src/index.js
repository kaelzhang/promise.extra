function seriesRunner (factory) {
  return factory.call(this)
}

function waterfallRunner (prev, factory) {
  return factory.call(this, prev)
}

export const factory = p => {
  function reduce (list, reducer, init) {
    const run = i =>
      prev => reducer.call(this, prev, list[i], i, list)

    // Do not save `list.length`,
    // because we allow user to modify the array `list`
    const next = (i, prev) => i < list.length
      ? list.hasOwnProperty(i)
        ? next(i + 1, prev.then(run(i)))
        : next(i + 1, prev)
      : prev

    return next(0, p.resolve(init))
  }

  function series (list, runner = seriesRunner) {
    return reduce.call(this, list, (prev, factory, i, list) => {
      return p.resolve(runner.call(this, factory, i, list))
      .then(result => {
        prev[i] = result
        return prev
      })
    }, [])
  }

  function waterfall (list, init, runner = waterfallRunner) {
    return reduce.call(this, list, runner, init)
  }

  function some (list, runner = seriesRunner) {
    let found

    return reduce.call(this, list, (prev, factory, i, list) => {
      if (found) {
        return found
      }

      return p.resolve(runner.call(this, factory, i, list))
      .then(result => {
        if (result) {
          found = true
          return found
        }
      })
    })
  }

  return {
    reduce,
    series,
    waterfall,
    some
  }
}

const {
  reduce,
  series,
  waterfall,
  some
} = factory(Promise)

export {
  reduce,
  series,
  waterfall,
  some
}
