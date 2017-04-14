#!/usr/bin/env node
const fs = require('fs')
const assert = require('assert')
const {
  conceal,
} = require('../lib/conceal')
const {
  reveal,
} = require('../lib/reveal')

const attemptTest = test => {
  try {
    test()
  } catch (e) {
    console.error(e)
  }
}

const testEndToEnd = () => {
  const image = fs.readFileSync(`${__dirname}/16x16.png`)
  const message = Buffer.from('testing testing 123')

  const testWithoutEncryption = () => {
    const concealed = conceal()(image, message)
    const result = reveal()(concealed)
    return assert.ok(result.equals(message))
  }

  const testWithEncryption = () => {
    const concealed = conceal('letmein')(image, message)
    const result = reveal('letmein')(concealed)
    return assert.ok(result.equals(message))
  }

  const testEncryptionRequired = () => {
    const concealed = conceal('letmein')(image, message)
    const result = reveal()(concealed)
    return assert.strictEqual(result.equals(message), false)
  }

  [
    testWithoutEncryption,
    testWithEncryption,
    testEncryptionRequired,
  ].forEach(attemptTest)
}

[
  testEndToEnd,
].forEach(attemptTest)
