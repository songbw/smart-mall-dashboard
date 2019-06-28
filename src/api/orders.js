import Vue from 'vue'

export function getOrderListApi(params) {
  return Vue.axios.request({
    url: '/orders/order/searchOrder',
    method: 'post',
    data: {
      ...params
    }
  })
}

export function getAddressApi(params) {
  return Vue.axios.request({
    url: '/orders/address/level',
    method: 'post',
    data: {
      ...params
    }
  })
}

export function deliveryUploadApi(params) {
  return Vue.axios.request({
    url: '/orders/order/uploadLogistics',
    method: 'post',
    data: {
      total: params.total,
      logisticsList: params.list
    }
  })
}
