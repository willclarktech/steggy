const { BYTE_SIZE } = require('./defaults')
const CHANNEL_COUNT = ['r', 'g', 'b', 'a'].length

const countBytesForNRgbBytes = n => Math.floor(n * BYTE_SIZE * CHANNEL_COUNT / (CHANNEL_COUNT - 1))

const isAlphaByte = (_, i) => !((i + 1) % CHANNEL_COUNT)
const isRgbByte = (_, i) => (i + 1) % CHANNEL_COUNT

const recombineRgbAndAlpha = (rgb, alpha) =>
  Buffer.from(
    Array(rgb.length + alpha.length)
      .fill(null)
      .map((_, i) => (i + 1) % CHANNEL_COUNT
        ? rgb[i - Math.floor(i / CHANNEL_COUNT)]
        : alpha[i % CHANNEL_COUNT]
      )
  )

const splitRgbAndAlpha = data => {
  const rgbBytes = data.filter(isRgbByte)
  const alphaBytes = data.filter(isAlphaByte)
  return [rgbBytes, alphaBytes]
}

module.exports = {
  countBytesForNRgbBytes,
  isAlphaByte,
  isRgbByte,
  recombineRgbAndAlpha,
  splitRgbAndAlpha,
}
