import request from '@/utils/authRequest'

export function login(username, password) {
  return request({
    url: '/sso/login',
    method: 'post',
    data: {
      username,
      password
    }
  })
}

export function getInfo(token) {
  return request({
    url: '/user/profile',
    method: 'get',
    params: { token }
  })
}

export function logout(username) {
  return request({
    url: '/sso/logout',
    method: 'delete',
    params: { username }
  })
}
