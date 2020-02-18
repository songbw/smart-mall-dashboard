import Vue from 'vue'

export function getBarterCardsApi(params) {
  return Vue.axios('barterCards')({
    url: '/equities/adminCard/find',
    method: 'get',
    params
  })
}

export function createBarterCardApi(params) {
  return Vue.axios('coupons')({
    url: '/equities/adminCard/create',
    method: 'post',
    data: params
  })
}

export function updateBarterCardApi(params) {
  return Vue.axios('coupons')({
    url: '/equities/adminCard/update',
    method: 'put',
    data: params
  })
}

export function deleteBarterCardApi(params) {
  return Vue.axios('coupons')({
    url: '/equities/adminCard/delete',
    method: 'delete',
    params
  })
}

export function getBarterCardInfoApi(params) {
  return Vue.axios('barterCards')({
    url: '/equities/adminCard/findById',
    method: 'get',
    params
  })
}

export function bindCouponWithBarterCardApi(params) {
  return Vue.axios('coupons')({
    url: '/equities/adminCardAndCoupon/create',
    method: 'post',
    data: params
  })
}

export function unbindCouponFromBarterCardApi(params) {
  return Vue.axios('coupons')({
    url: '/equities/adminCardAndCoupon/delete',
    method: 'delete',
    params
  })
}

export function distributeBarterCardApi(params) {
  return Vue.axios('coupons')({
    url: '/equities/adminCard/assigns',
    method: 'post',
    data: params
  })
}

export function getTicketsByIdApi(params) {
  return Vue.axios('barterCards')({
    url: '/equities/adminCard/details',
    method: 'get',
    params
  })
}

export function exportTicketsByIdApi(params) {
  return Vue.axios('orders').request({
    url: '/equities/adminCard/export',
    method: 'get',
    responseType: 'blob',
    params
  })
}

export function batchActivateTicketsApi(params) {
  return Vue.axios('coupons')({
    url: '/equities/adminCard/activate',
    method: 'put',
    data: params
  })
}
