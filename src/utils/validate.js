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

export function validateURL(textval) {
  const urlregex = /^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/
  return urlregex.test(textval)
}
