const { PNG } = require('pngjs')
const { encrypt, getShasumData } = require('./encryption')
const {
  countBytesForNRgbBytes,
  isAlphaByte,
  isRgbByte,
  recombineRgbAndAlpha,
  splitRgbAndAlpha,
} = require('./png')
const {
  BYTE_SIZE,
  LENGTH_BYTES,
  SHASUM_BYTES,
} = require('./defaults')

const getLengthData = message => {
  const lengthHex = message.length.toString(16)
  const lengthBuffer = Buffer.from(lengthHex.length % 2 ? `0${lengthHex}` : lengthHex, 'hex')
  const pad = Buffer.alloc(LENGTH_BYTES - lengthBuffer.length)
  return Buffer.concat([pad, lengthBuffer], LENGTH_BYTES)
}

const getBit = data => i => {
  const byteIndex = Math.floor(i / BYTE_SIZE)
  const bitIndex = i % BYTE_SIZE

  const byte = data[byteIndex]
  const shiftDistance = (BYTE_SIZE - 1) - bitIndex
  return (byte >> shiftDistance) % 2
}

const addDataToByte = data => (byte, i) =>
  ((byte >> 1) << 1) | getBit(data)(i)

const embedData = ([data, bed]) => bed.map(addDataToByte(data))

const store = (imageData, message) => {
  const bytesAvailable = imageData.length
  const bytesToStore = LENGTH_BYTES + SHASUM_BYTES + message.length
  const bytesRequired = countBytesForNRgbBytes(bytesToStore)

  if (bytesAvailable < bytesRequired)
    throw new Error('Image is not large enough to store message')

  const lengthData = getLengthData(message)
  const shasumData = getShasumData(message)

  const bytesToUse = imageData.slice(0, bytesRequired)
  const bytesToLeave = imageData.slice(bytesRequired)

  const [ rgb, alpha ] = splitRgbAndAlpha(bytesToUse)

  const lengthDataSize = LENGTH_BYTES * BYTE_SIZE
  const shasumDataSize = SHASUM_BYTES * BYTE_SIZE

  const bytesToUseWithLengthData = rgb.slice(0, lengthDataSize)
  const bytesToUseWithShasumData = rgb.slice(lengthDataSize, lengthDataSize + shasumDataSize)
  const bytesToUseWithMessageData = rgb.slice(lengthDataSize + shasumDataSize)

  const embeddedData = Buffer.concat([
    [lengthData, bytesToUseWithLengthData],
    [shasumData, bytesToUseWithShasumData],
    [message, bytesToUseWithMessageData],
  ].map(embedData), rgb.length)

  const recombined = recombineRgbAndAlpha(embeddedData, alpha)
  const adjustedImageData = Buffer.concat([recombined, bytesToLeave], bytesAvailable)

  return adjustedImageData
}

const conceal = password => (image, message, encoding) => {
  const messageBuffer = Buffer.isBuffer(message)
    ? message
    : Buffer.from(message, encoding)
  const secretBuffer = password
    ? encrypt(message, password)
    : messageBuffer

  const png = PNG.sync.read(image)
  const data = store(png.data, secretBuffer)
  const adjustedPng = Object.assign({}, png, { data })

  return PNG.sync.write(adjustedPng)
}

module.exports = {
  conceal,
}
