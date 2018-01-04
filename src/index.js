export function reduce (list, reducer, init) {
  const run = (i, prev) =>
  // Do not save `list.length`,
  // because we allow user to modify the array `list`
  i < list.length
    ? Promise.resolve(reducer.call(this, prev, list[i], i, list))
      .then(prev => run(i + 1, prev))
    : Promise.resolve(prev)

  return run(0, init)
}

function seriesRunner (factory) {
  return factory.call(this)
}

export function series (list, runner = seriesRunner) {
  return reduce.call(this, list, (prev, factory, i, list) => {
    return Promise.resolve(runner.call(this, factory, i, list))
    .then(result => {
      prev.push(result)
      return prev
    })
  }, [])
}

function waterfallRunner (prev, factory) {
  return factory.call(this, prev)
}

export function waterfall (list, init, runner = waterfallRunner) {
  return reduce.call(this, list, runner, init)
}
