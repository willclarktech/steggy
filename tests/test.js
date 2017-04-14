#!/usr/bin/env node
const assert = require('assert')
const {
  getMessageIndex,
} = require('../lib/conceal')

const testGetMessageIndex = () => {
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
      assert.strictEqual(getMessageIndex(input), output)
    )
  }

  const testInvalidInputs = () => {
    const invalid = [3, 7, 11, 103]

    invalid.forEach(input =>
      assert.throws(getMessageIndex.bind(null, input), /Cannot get bit index/)
    )
  }

  testCorrectOutputs()
  testInvalidInputs()
}

[
  testGetMessageIndex,
].forEach(test => test())
