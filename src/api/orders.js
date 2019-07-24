import Vue from 'vue'
import axios from 'axios'

export function getOrderListApi(params) {
  return Vue.axios('orders').request({
    url: '/orders/order/searchOrder',
    method: 'post',
    data: {
      ...params
    }
  })
}

export function getMainOrderDetailApi(params) {
  return Vue.axios('orders').request({
    url: '/orders/order/searchDetail',
    method: 'post',
    data: {
      ...params
    }
  })
}

export function updateOrderRemarkApi(params) {
  return Vue.axios('orders').request({
    url: '/orders/order/updateRemark',
    method: 'post',
    data: {
      ...params
    }
  })
}

export function getAddressApi(params) {
  return Vue.axios('orders').request({
    url: '/orders/address/level',
    method: 'post',
    data: {
      ...params
    }
  })
}

export function getLogisticsInfoApi(params) {
  return Vue.axios('orders').request({
    url: '/orders/order/logistics',
    method: 'get',
    params
  })
}

export function deliveryUploadApi(params) {
  return Vue.axios('orders').request({
    url: '/orders/order/uploadLogistics',
    method: 'post',
    data: {
      total: params.total,
      logisticsList: params.list
    }
  })
}

export function exportOrdersApi(params) {
  return Vue.axios('orders').request({
    url: '/orders/adminorder/export',
    method: 'get',
    responseType: 'arraybuffer',
    params
  })
}
