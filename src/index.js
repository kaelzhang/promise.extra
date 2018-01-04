function seriesRunner (factory) {
  return factory.call(this)
}

function series (list, runner = seriesRunner) {
  const length = list.length
  const results = []

  if (length === 0) {
    return results
  }

  const run = i => i < length
    ? Promise.resolve(runner.call(this, list[i]))
      .then(r => {
        results.push(r)
        return run(i + 1)
      })
    : results

  return run(0)
}

function waterfallRunner (factory, prev) {
  return factory.call(this, prev)
}

function waterfall (list, init, runner = waterfallRunner) {
  const length = list.length
  const prev = Promise.resolve(init)
  if (length === 0) {
    return prev
  }

  const run = (i, prev) => i < length
    ? runner.call(this, list[i], prev)
      .then(prev => run(i + 1, prev))
    : prev

  return prev.then(prev => run(0, prev))
}

export {
  series,
  waterfall
}
