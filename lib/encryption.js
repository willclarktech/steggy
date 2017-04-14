const crypto = require('crypto')
const { ENCRYPTION_METHOD } = require('./defaults')

const decrypt = (data, password) => {
  const decipher = crypto.createDecipher(ENCRYPTION_METHOD, password)
  const chunk1 = decipher.update(data)
  const chunk2 = decipher.final()
  return Buffer.concat([chunk1, chunk2], chunk1.length + chunk2.length)
}

const encrypt = (message, password) => {
  const cipher = crypto.createCipher(ENCRYPTION_METHOD, password)
  const chunk1 = cipher.update(message)
  const chunk2 = cipher.final()
  return Buffer.concat([chunk1, chunk2], chunk1.length + chunk2.length)
}

const getShasumData = message =>
  crypto
    .createHash('sha256')
    .update(message)
    .digest()

module.exports = {
  decrypt,
  encrypt,
  getShasumData,
}
