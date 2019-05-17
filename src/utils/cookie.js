import Cookies from 'js-cookie'

const TokenKey = 'Admin-Token'
const UserNameKey = 'Admin-User-Name'

export function getToken() {
  return Cookies.get(TokenKey)
}

export function setToken(token) {
  return Cookies.set(TokenKey, token, { expires: 1 })
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}

export function getUserName() {
  return Cookies.get(UserNameKey)
}

export function setUserName(name) {
  return Cookies.set(UserNameKey, name, { expires: 1 })
}

export function removeUserName() {
  return Cookies.remove(UserNameKey)
}
