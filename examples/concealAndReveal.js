#!/usr/bin/env node
const fs = require('fs')
const {
  conceal,
  reveal,
} = require('../index')

////////////////////////////////////////////////////////////////
// CONCEAL
////////////////////////////////////////////////////////////////

const [,, messageFile, inputFile, outputFile] = process.argv
const message = messageFile
  ? fs.readFileSync(messageFile)
  : 'just testing'
const original = fs.readFileSync(inputFile || './tmp/input.png')
const concealed = conceal()(original, message)
fs.writeFileSync(outputFile || './tmp/output.png', concealed)

////////////////////////////////////////////////////////////////
// REVEAL
////////////////////////////////////////////////////////////////

const image = fs.readFileSync(outputFile || './tmp/output.png')
const revealed = reveal()(image, 'utf8')
console.info('message was:', revealed)
