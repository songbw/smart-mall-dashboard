import Vue from 'vue'

export function loginApi(data) {
  return Vue.axios.request({
    url: '/vendors/v1/users/login',
    method: 'post',
    data
  })
}

export function twoFactorAuthApi(data) {
  return Vue.axios.request({
    url: '/vendors/v1/users/two_factor_auth',
    method: 'post',
    data
  })
}

export function registerApi(data) {
  return Vue.axios.request({
    url: '/vendors/v1/vendors',
    method: 'post',
    data
  })
}

export function getVerificationCodeApi(params) {
  return Vue.axios.request({
    url: '/vendors/v1/users/verification_code',
    method: 'get',
    params
  })
}

export function getRoleApi() {
  return Vue.axios.request({
    url: '/vendors/v1/users/role',
    method: 'get'
  })
}

export function logoutApi() {
  return Vue.axios.request({
    url: '/vendors/v1/users/logout',
    method: 'delete'
  })
}
