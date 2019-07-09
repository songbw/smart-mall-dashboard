import Vue from 'vue'

export function getCosUrlApi() {
  return Vue.axios.request({
    url: '/bases//cos/url',
    method: 'get'
  })
}
