import Vue from 'vue'

export function getMembersApi(params) {
  return Vue.axios('members')({
    url: '/ssoes/user/list',
    method: 'get',
    params
  })
}

export function getMemberProfileApi(params) {
  return Vue.axios('members')({
    url: '/ssoes/user/profile',
    method: 'get',
    params
  })
}
