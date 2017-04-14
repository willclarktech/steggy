const { PNG } = require('pngjs')
const { BYTE_SIZE, CHANNEL_COUNT } = require('./defaults')

const isAlphaAndOdd = (b, i) => !((i + 1) % CHANNEL_COUNT) && b % 2
const removeAlpha = (_, i) => (i + 1) % CHANNEL_COUNT
const extractBinary = b => b % 2

const splitBitsAsBytes = bitsAsBytes => (_, i) => {
  const start = i * BYTE_SIZE
  return bitsAsBytes.slice(start, start + BYTE_SIZE)
}

const combineByteIntoBit = (accumulator, currentByte, i) => {
  const shiftDistance = (BYTE_SIZE - 1) - i
  return (currentByte << shiftDistance) | accumulator
}

const combineBufferIntoByte = buffer =>
  buffer.reduce(combineByteIntoBit, 0)

const combineBits = bitsAsBytes => {
  const n = Math.ceil(bitsAsBytes.length / BYTE_SIZE)
  return Array(n)
    .fill(null)
    .map(splitBitsAsBytes(bitsAsBytes))
    .map(combineBufferIntoByte)
}

const extract = imageData => {
  const endIndex = imageData.findIndex(isAlphaAndOdd)
  const bitsAsBytes = imageData
    .slice(0, endIndex)
    .filter(removeAlpha)
    .map(extractBinary)

  const combined = combineBits(bitsAsBytes)
  return Buffer.from(combined)
}

const reveal = (image, encoding) => {
  const png = PNG.sync.read(image)
  const message = extract(png.data)
  return encoding
    ? message.toString(encoding)
    : message
}

module.exports = {
  reveal,
}
