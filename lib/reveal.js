const { PNG } = require('pngjs')
const { decrypt, getShasumData } = require('./encryption')
const { isRgbByte } = require('./png')
const {
  BYTE_SIZE,
  LENGTH_BYTES,
  SHASUM_BYTES,
} = require('./defaults')

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

const messageMatchesShasum = (message, shasum) =>
  getShasumData(message).equals(shasum)

const extractData = imageData => {
  const rgb = imageData.filter(isRgbByte)

  const lengthDataSize = LENGTH_BYTES * BYTE_SIZE
  const shasumDataSize = SHASUM_BYTES * BYTE_SIZE
  const lengthAndShasumSize = lengthDataSize + shasumDataSize

  const lengthData = rgb.slice(0, lengthDataSize)
  const decodedLengthData = decode(lengthData)
  const length = parseInt(decodedLengthData.toString('hex'), 16) * BYTE_SIZE

  const shasumData = rgb.slice(lengthDataSize, lengthAndShasumSize)
  const decodedShasumData = decode(shasumData)

  const messageData = rgb.slice(lengthAndShasumSize, lengthAndShasumSize + length)
  const decodedMessageData = decode(messageData)

  if (!messageMatchesShasum(decodedMessageData, decodedShasumData))
    throw new Error('Shasum did not match decoded message')

  return decodedMessageData
}

const reveal = password => (image, encoding) => {
  const png = PNG.sync.read(image)
  const data = extractData(png.data)

  const output = password
    ? decrypt(data, password)
    : data

  return encoding
    ? output.toString(encoding)
    : output
}

module.exports = {
  reveal,
}
