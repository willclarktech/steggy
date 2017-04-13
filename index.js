const { PNG } = require('pngjs')

const BYTE_SIZE = 8
const CHANNEL_COUNT = 4

////////////////////////////////////////////////////////////////
// CONCEAL
////////////////////////////////////////////////////////////////

const getBitIndex = i => {
  if (!((i + 1) % CHANNEL_COUNT))
    throw new Error('Cannot get bit index for Alpha channel')

  return i - Math.floor(i / CHANNEL_COUNT)
}

const getMessageBit = (message, i) => {
  const index = getBitIndex(i)
  const byteIndex = Math.floor(index / BYTE_SIZE)
  const bitIndex = index % BYTE_SIZE

  const byte = message[byteIndex]
  const shiftDistance = (BYTE_SIZE - 1) - bitIndex
  return (byte >> shiftDistance) % 2
}

const adjustImageData = (message, bytesRequired) => (b, i) =>
  // message storage stops here
  i === bytesRequired - 1 ? b | 1 :
  // message storage continues after this point
  !((i + 1) % CHANNEL_COUNT) ? (b >> 1) << 1 :
  // encode a message bit in the image byte
  ((b >> 1) << 1) | getMessageBit(message, i)

const store = (imageData, message) => {
  // it takes CHANNEL_COUNT bytes to store CHANNEL_COUNT - 1 bits
  const bytesRequired = Math.ceil(message.length * BYTE_SIZE * CHANNEL_COUNT / (CHANNEL_COUNT - 1))
  if (imageData.length < bytesRequired)
    throw new Error('Image is not large enough to store message')

  const adjusted = imageData
    .slice(0, bytesRequired)
    .map(adjustImageData(message, bytesRequired))
  const adjustedBuffer = Buffer.from(adjusted)
  return Buffer.concat([adjustedBuffer, imageData.slice(bytesRequired)])
}

const conceal = (image, secret, encoding) => {
  const secretBuffer = Buffer.isBuffer(secret)
    ? secret
    : Buffer.from(secret, encoding)
  const png = PNG.sync.read(image)
  const data = store(png.data, secretBuffer)
  const adjusted = Object.assign({}, png, { data })
  return PNG.sync.write(adjusted)
}

////////////////////////////////////////////////////////////////
// REVEAL
////////////////////////////////////////////////////////////////

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

////////////////////////////////////////////////////////////////
// EXPORTS
////////////////////////////////////////////////////////////////

module.exports = {
  getBitIndex,
  conceal,
  reveal,
}
