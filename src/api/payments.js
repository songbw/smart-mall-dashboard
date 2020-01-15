import Vue from 'vue'

export function getPayInfoListApi(params) {
  return Vue.axios('pays').request({
    url: '/aggpays/wspay/query/pay',
    method: 'get',
    params
  })
}

export function getAllPayTypeListApi() {
  return Vue.axios('pays').request({
    url: '/aggpays/paytype/all',
    method: 'get'
  })
}

export function getPayTypeListByAppIdApi(params) {
  return Vue.axios('pays').request({
    url: '/aggpays/paytype/query',
    method: 'get',
    params
  })
}

export function bindPayTypeWithPlatformApi(params) {
  return Vue.axios('pays').request({
    url: '/aggpays/paytype/add',
    method: 'post',
    data: {
      ...params
    }
  })
}

export function deletePayTypeFromAppIdApi(params) {
  return Vue.axios('pays').request({
    url: '/aggpays/paytype/del',
    method: 'delete',
    params
  })
}
