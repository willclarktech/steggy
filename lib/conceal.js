const { PNG } = require('pngjs')
const { BYTE_SIZE, CHANNEL_COUNT } = require('./defaults')

const getMessageIndex = i => {
  if (!((i + 1) % CHANNEL_COUNT))
    throw new Error('Cannot get bit index for Alpha channel')

  return i - Math.floor(i / CHANNEL_COUNT)
}

const getMessageBit = (message, i) => {
  const index = getMessageIndex(i)
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

module.exports = {
  getMessageIndex,
  conceal,
}
