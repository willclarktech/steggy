#!/usr/bin/env node
const assert = require('assert')
const {
  getBitIndex,
} = require('../lib/conceal')

const testGetBitIndex = () => {
  const testCorrectOutputs = () => {
    const correct = [
      [0, 0],
      [1, 1],
      [2, 2],
      [4, 3],
      [5, 4],
      [12, 9],
      [13, 10],
    ]

    correct.forEach(([input, output]) =>
      assert.strictEqual(getBitIndex(input), output)
    )
  }

  const testInvalidInputs = () => {
    const invalid = [3, 7, 11, 103]

    invalid.forEach(input =>
      assert.throws(getBitIndex.bind(null, input), /Cannot get bit index/)
    )
  }

  testCorrectOutputs()
  testInvalidInputs()
}

[
  testGetBitIndex,
].forEach(test => test())
