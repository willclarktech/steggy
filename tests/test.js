#!/usr/bin/env node
const assert = require('assert')
const {
  getMessageIndex,
} = require('../lib/conceal')

const testGetMessageIndex = () => {
  const testCorrectOutputs = () =>
    [
      [0, 0],
      [1, 1],
      [2, 2],
      [4, 3],
      [5, 4],
      [12, 9],
      [13, 10],
    ].forEach(([input, output]) =>
      assert.strictEqual(getMessageIndex(input), output)
    )

  const testInvalidInputs = () =>
    [3, 7, 11, 103].forEach(input =>
      assert.throws(getMessageIndex.bind(null, input), /Cannot get bit index/)
    )

  testCorrectOutputs()
  testInvalidInputs()
}

[
  testGetMessageIndex,
].forEach(test => test())
