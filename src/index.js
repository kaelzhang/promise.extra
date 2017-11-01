function series (list, ...args) {
  const result = list.reduce((prev, current) => {
    if (prev.p === null) {
      prev.p = Promise.resolve(current.apply(this, args))
      return prev
    }

    prev.p = prev.p.then((r) => {
      prev.results.push(r)
      return current.apply(this, args)
    })

    return prev

  }, {
    p: null,
    results: []
  })


  return result
  .p
  .then((r) => {
    result.results.push(r)
    return result.results
  })
}


function waterfall (list, init, ...args) {
  return list.reduce((prev, current) => {
    return prev.then(x => current.call(this, x, ...args))
  }, Promise.resolve(init))
}


export {
  series,
  waterfall
}
