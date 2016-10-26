function series (list, runner) {
  const result = list.reduce((prev, current) => {
    if (prev.p === null) {
      prev.p = current()
      return prev
    }

    prev.p = prev.p.then((r) => {
      prev.results.push(r)
      return current()
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


function waterfall (list, init) {
  return list.reduce((prev, current) => {
    return prev.then(current)
  }, Promise.resolve(init))
}


export {
  series,
  waterfall
}
