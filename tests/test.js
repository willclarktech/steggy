#!/usr/bin/env node
const fs = require('fs')
const assert = require('assert')
const {
  getMessageIndex,
  conceal,
} = require('../lib/conceal')
const {
  reveal,
} = require('../lib/reveal')

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

const testEndToEnd = () => {
  const testWithBuffers = () => {
    const image = fs.readFileSync(`${__dirname}/16x16.png`)
    const message = Buffer.from('testing testing 123')

    const concealed = conceal(image, message)
    const result = reveal(concealed)

    return assert.ok(result.equals(message))
  }

  testWithBuffers()
}

[
  testEndToEnd,
  testGetMessageIndex,
].forEach(test => test())
