#!/usr/bin/env node
const fs = require('fs')
const assert = require('assert')
const {
  conceal,
} = require('../lib/conceal')
const {
  reveal,
} = require('../lib/reveal')

const testEndToEnd = () => {
  const testWithBuffers = () => {
    const image = fs.readFileSync(`${__dirname}/16x16.png`)
    const message = Buffer.from('testing testing 123')

    const concealed = conceal(image, message)
    fs.writeFileSync('./tmp/TEST.png', concealed)
    const result = reveal(concealed)
    console.log('message was:', result.toString())

    return assert.ok(result.equals(message))
  }

  testWithBuffers()
}

[
  testEndToEnd,
].forEach(test => test())
