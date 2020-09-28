import { customAlphabet } from 'nanoid'
import moment from 'moment'

export function getDigitalId(size) {
  const timestamp = moment().valueOf().toString()
  const nanoSize = size > timestamp.length ? size - timestamp.length : size
  const nanoId = customAlphabet('123456789', nanoSize)
  const random = nanoId()
  return nanoSize === size ? random : random + timestamp
}

export function floatToFixed(value, precision = 2) {
  return parseFloat((Math.round(value * Math.pow(10, precision)) / Math.pow(10, precision)).toFixed(precision))
}
