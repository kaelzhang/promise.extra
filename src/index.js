function defaultRunner (prev, factory) {
  return factory.call(this, prev)
}

const isPositive = x => x
const isNegative = x => !x

const factory = p => {
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

  function series (list, runner = defaultRunner) {
    return reduce.call(this, list, (prev, factory, i, list) => {
      return p.resolve(runner.call(this, prev, factory, i, list))
      .then(result => {
        prev[i] = result
        return prev
      })
    }, [])
  }

  function waterfall (list, init, runner = defaultRunner) {
    return reduce.call(this, list, runner, init)
  }

  function findIndex (list, matcher, runner = defaultRunner) {
    return reduce.call(this, list, (prev, factory, i, list) => {
      if (prev !== -1) {
        return prev
      }

      return p.resolve(runner.call(this, prev, factory, i, list))
      .then(result => matcher.call(this, result, i, list))
      .then(matched =>
        matched
          ? i
          : -1
      )
    }, -1)
  }

  function indexOf (list, value, runner) {
    return findIndex.call(this, list, result => result === value, runner)
  }

  function some (list, runner) {
    return findIndex.call(this, list, isPositive, runner)
    .then(index =>
      index !== -1
        ? true
        : false
    )
  }

  function every (list, runner) {
    return findIndex.call(this, list, isNegative, runner)
    .then(index =>
      index === -1
        ? true
        : false
    )
  }

  return {
    reduce,
    series,
    waterfall,
    findIndex,
    indexOf,
    some,
    every
  }
}

module.exports = factory(Promise)
module.exports.factory = factory
