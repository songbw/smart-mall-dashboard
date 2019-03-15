import request from '@/utils/userLoginRequest'

export function getCode(username) {
  return request({
    url: 'getCode',
    method: 'get',
    params: { username }
  })
}

export function userLogin(data) {
  return request({
    url: 'login',
    method: 'post',
    data: {
      username: data.username,
      password: data.password,
      code: data.verifyCode,
      oldPassword: ''
    }
  })
}

export function userRegistry(data) {
  return request({
    url: 'user/registry',
    method: 'post',
    data: {
      loginName: data.username,
      password: data.password,
      code: data.code,
      zhName: data.zhName,
      enName: data.enName,
      address: data.address,
      birth: data.birth,
      sex: data.sex,
      email: data.email
    }
  })
}
