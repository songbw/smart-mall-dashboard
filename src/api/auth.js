import Vue from 'vue'

export function loginApi(data) {
  return Vue.axios('auth').request({
    url: '/vendors/users/login',
    method: 'post',
    data
  })
}

export function twoFactorAuthApi(data) {
  return Vue.axios('auth').request({
    url: '/vendors/users/two_factor_auth',
    method: 'post',
    data
  })
}

export function registerApi(data) {
  return Vue.axios('auth').request({
    url: '/vendors/vendors',
    method: 'post',
    data
  })
}

export function passwordNewApi(data) {
  return Vue.axios('auth').request({
    url: '/vendors/vendors/password',
    method: 'put',
    data
  })
}

export function passwordChangeApi(data) {
  return Vue.axios('auth').request({
    url: '/vendors/users/password',
    method: 'put',
    data
  })
}

export function getVerificationCodeApi(params) {
  return Vue.axios('auth').request({
    url: '/vendors/users/verification_code',
    method: 'get',
    params
  })
}

export function getRoleApi() {
  return Vue.axios('auth').request({
    url: '/vendors/users/role',
    method: 'get'
  })
}

export function logoutApi() {
  return Vue.axios('auth').request({
    url: '/vendors/users/logout',
    method: 'delete'
  })
}
