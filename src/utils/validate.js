import { parsePhoneNumberFromString } from 'libphonenumber-js'
import isEmpty from 'lodash/isEmpty'

export function isExternal(path) {
  return /^(https?:|mailto:|tel:)/.test(path)
}

export function validUserName(str) {
  const reg = /^[a-zA-Z][a-zA-Z0-a.-]{2}/
  return reg.test(str)
}

export function validPhone(str) {
  return isEmpty(str) ? false : parsePhoneNumberFromString(str, 'CN').isValid()
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
