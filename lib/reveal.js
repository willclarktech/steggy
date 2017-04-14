const { PNG } = require('pngjs')
const {
  BYTE_SIZE,
  CHANNEL_COUNT,
  LENGTH_BYTES,
  SHASUM_BYTES,
} = require('./defaults')

const isRgbByte = (_, i) => (i + 1) % CHANNEL_COUNT
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

const decode = data => {
  const bitsAsBytes = data.map(extractBinary)
  const combined = combineBits(bitsAsBytes)
  return Buffer.from(combined)
}

const extractData = imageData => {
  const rgb = imageData.filter(isRgbByte)

  const lengthDataSize = LENGTH_BYTES * BYTE_SIZE
  const shasumDataSize = SHASUM_BYTES * BYTE_SIZE
  const lengthAndShasumSize = lengthDataSize + shasumDataSize

  const lengthData = rgb.slice(0, lengthDataSize)
  const shasumData = rgb.slice(lengthDataSize, lengthAndShasumSize)
  console.log('lengthData, shasumData', lengthData, shasumData)

  const decodedLengthData = decode(lengthData)
  const length = parseInt(decodedLengthData.toString('hex'), 16) * BYTE_SIZE

  const messageData = rgb.slice(lengthAndShasumSize, lengthAndShasumSize + length)
  const decodedMessageData = decode(messageData)

  return decodedMessageData
}

const reveal = (image, encoding) => {
  const png = PNG.sync.read(image)
  const data = extractData(png.data)

  return encoding
    ? data.toString(encoding)
    : data
}

module.exports = {
  reveal,
}
