function seriesRunner (factory) {
  return factory.call(this)
}

function waterfallRunner (prev, factory) {
  return factory.call(this, prev)
}

const factory = p => {
  function reduce (list, reducer, init) {
    const run = (i, prev) =>
    // Do not save `list.length`,
    // because we allow user to modify the array `list`
    i < list.length
      ? p.resolve(reducer.call(this, prev, list[i], i, list))
        .then(prev => run(i + 1, prev))
      : p.resolve(prev)

    return run(0, init)
  }

  function series (list, runner = seriesRunner) {
    return reduce.call(this, list, (prev, factory, i, list) => {
      return p.resolve(runner.call(this, factory, i, list))
      .then(result => {
        prev.push(result)
        return prev
      })
    }, [])
  }

  function waterfall (list, init, runner = waterfallRunner) {
    return reduce.call(this, list, runner, init)
  }

  return {
    reduce,
    series,
    waterfall
  }
}

module.exports = factory(Promise)
module.exports.factory = factory
