#!/usr/bin/env node
const assert = require('assert')
const {
  getBitIndex,
  // conceal,
} = require('../lib/conceal')
const {
  // reveal,
} = require('../lib/reveal')

const testGetBitIndex = () => {
  const correct = [
    [0, 0],
    [1, 1],
    [2, 2],
    [4, 3],
    [5, 4],
    [12, 9],
    [13, 10],
  ]
  const invalid = [3, 7, 11, 103]

  correct.forEach(([input, output]) =>
    assert.strictEqual(getBitIndex(input), output)
  )
  invalid.forEach(input =>
    assert.throws(getBitIndex.bind(null, input), /Cannot get bit index/)
  )
}

[
  testGetBitIndex,
].forEach(test => test())
