const { PNG } = require('pngjs')
const { encrypt, getShasumData } = require('./encryption')
const {
  BYTE_SIZE,
  CHANNEL_COUNT,
  LENGTH_BYTES,
  SHASUM_BYTES,
} = require('./defaults')

const isRgbByte = (_, i) => (i + 1) % CHANNEL_COUNT
const isAlphaByte = (_, i) => !((i + 1) % CHANNEL_COUNT)

const getLengthData = message => {
  const lengthHex = message.length.toString(16)
  const lengthBuffer = Buffer.from(lengthHex.length % 2 ? `0${lengthHex}` : lengthHex, 'hex')
  const pad = Buffer.alloc(LENGTH_BYTES - lengthBuffer.length)
  return Buffer.concat([pad, lengthBuffer], LENGTH_BYTES)
}

const splitRgbAndAlpha = data => {
  const rgbBytes = data.filter(isRgbByte)
  const alphaBytes = data.filter(isAlphaByte)
  return [rgbBytes, alphaBytes]
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

const recombine = (rgb, alpha) =>
  Array(rgb.length + alpha.length)
    .fill(null)
    .map((_, i) => (i + 1) % CHANNEL_COUNT
      ? rgb[i - Math.floor(i / CHANNEL_COUNT)]
      : alpha[i % CHANNEL_COUNT]
    )

const store = (imageData, message) => {
  const bytesAvailable = imageData.length
  const bytesToStore = LENGTH_BYTES + SHASUM_BYTES + message.length
  // it takes CHANNEL_COUNT bytes to store CHANNEL_COUNT - 1 bits
  const bytesRequired = Math.floor(bytesToStore * BYTE_SIZE * CHANNEL_COUNT / (CHANNEL_COUNT - 1))

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

  const recombined = Buffer.from(recombine(embeddedData, alpha))
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
  const adjusted = Object.assign({}, png, { data })
  return PNG.sync.write(adjusted)
}

module.exports = {
  conceal,
}
