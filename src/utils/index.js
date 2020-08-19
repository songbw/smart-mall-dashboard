import { customAlphabet } from 'nanoid'
import moment from 'moment'

export function getDigitalId(size) {
  const timestamp = moment().valueOf().toString()
  const nanoSize = size > timestamp.length ? size - timestamp.length : size
  const nanoId = customAlphabet('123456789', nanoSize)
  const random = nanoId()
  return nanoSize === size ? random : random + timestamp
}
