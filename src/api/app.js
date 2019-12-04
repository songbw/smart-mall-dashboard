import Vue from 'vue'

export function getCosUrlApi() {
  return Vue.axios('app').request({
    url: '/bases/cos/url',
    method: 'get'
  })
}

export function getCosStsApi() {
  return Vue.axios('app').request({
    url: '/bases/cos/sts',
    method: 'get'
  })
}
