import PasswordValidator from 'password-validator'
import isEmpty from 'lodash/isEmpty'

const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance()

export function isExternal(path) {
  return /^(https?:|mailto:|tel:)/.test(path)
}

export function validUserName(str) {
  const reg = /^[a-zA-Z][a-zA-Z0-a.-]{2}/
  return reg.test(str)
}

export function validPassword(password) {
  const schema = new PasswordValidator()
  schema
    .is().min(8)
    .is().max(20)
    .has().uppercase()
    .has().lowercase()
    .has().digits()
    .has().not().spaces()
    .has(/^[A-Za-z]/)
  return schema.validate(password, { list: false })
}

export function validPhone(str) {
  const value = isEmpty(str.trim()) ? null : str.trim()
  if (value === null) {
    return false
  }
  try {
    const number = phoneUtil.parseAndKeepRawInput(value, 'CN')
    return phoneUtil.isValidNumber(number)
  } catch (_) {
    return false
  }
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
