import Vue from 'vue'

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

export function updateSubOrderApi(params) {
  return Vue.axios('orders').request({
    url: '/orders/order/subOrder',
    method: 'put',
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
    url: '/orders/order/sub/logistics',
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
    url: '/orders/adminorder/export/admin',
    method: 'get',
    responseType: 'blob',
    params
  })
}

export function exportVendorOrdersApi(params) {
  return Vue.axios('orders').request({
    url: '/orders/adminorder/export',
    method: 'get',
    responseType: 'blob',
    params
  })
}

export function getExpressCompanyApi(params) {
  return Vue.axios('orders').request({
    url: '/orders/kuaidi/all',
    method: 'post',
    data: {
      ...params
    }
  })
}

export function uploadLogisticsApi(params) {
  return Vue.axios('orders').request({
    url: '/orders/order/uploadLogistics',
    method: 'post',
    data: {
      ...params
    }
  })
}

export function exportReconciliationApi(params) {
  return Vue.axios('orders').request({
    url: '/orders/adminorder/export/admin/reconciliation',
    method: 'get',
    responseType: 'blob',
    params
  })
}

export function exportVendorReconciliationApi(params) {
  return Vue.axios('orders').request({
    url: '/orders/adminorder/export/reconciliation',
    method: 'get',
    responseType: 'blob',
    params
  })
}

export function exportPaymentBillApi(params) {
  return Vue.axios('orders').request({
    url: '/orders/adminorder/export/bill',
    method: 'post',
    responseType: 'blob',
    data: {
      ...params
    }
  })
}

export function exportVendorDeliverOrdersApi() {
  return Vue.axios('orders').request({
    url: '/orders/adminorder/export/daily/order',
    method: 'get',
    responseType: 'blob'
  })
}

export function getPayInfoListApi(params) {
  return Vue.axios('orders').request({
    url: '/aggpays/wspay/query/pay',
    method: 'get',
    params
  })
}
