import Vue from 'vue'

export function getPayInfoListApi(params) {
  return Vue.axios('orders').request({
    url: '/aggpays/wspay/query/pay',
    method: 'get',
    params
  })
}
