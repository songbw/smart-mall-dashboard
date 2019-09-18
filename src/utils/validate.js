export function isExternal(path) {
  return /^(https?:|mailto:|tel:)/.test(path)
}

export function validUserName(str) {
  const reg = /^[a-zA-Z][a-zA-Z0-a.-]{2}/
  return reg.test(str)
}

export function validPhone(str) {
  const reg = /^[1][3,4,5,7,8][0-9]{9}$/
  return reg.test(str)
}

export function validVerificationCode(str) {
  const reg = /[0-9]{6}/
  return reg.test(str)
}

export function validZipCode(str) {
  const reg = /^[0-9]{6}$/
  return reg.test(str)
}

export function validateURL(url) {
  const urlRegex = require('url-regex')
  return urlRegex({ exact: true }).test(url)
}
