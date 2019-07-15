import Vue from 'vue'

export function getCouponsApi(params) {
  return Vue.axios('coupons')({
    url: '/equities/adminCoupon/find',
    method: 'get',
    params
  })
}

export function searchCouponsApi(params) {
  return Vue.axios('coupons')({
    url: '/equities/adminCoupon/search',
    method: 'post',
    data: { ...params }
  })
}

export function getCouponByIdApi(params) {
  return Vue.axios('coupons')({
    url: '/equities/adminCoupon/findById',
    method: 'get',
    params
  })
}

export function createCouponApi(params) {
  return Vue.axios('coupons')({
    url: '/equities/adminCoupon/create',
    method: 'post',
    data: { ...params }
  })
}

export function updateCouponApi(params) {
  return Vue.axios('coupons')({
    url: '/equities/adminCoupon/update',
    method: 'post',
    data: { ...params }
  })
}

export function deleteCouponApi(params) {
  return Vue.axios('coupons')({
    url: '/equities/adminCoupon/delete',
    method: 'delete',
    params
  })
}

export function getCouponUsageByIdApi(params) {
  return Vue.axios('coupons')({
    url: '/equities/adminCoupon/usageById',
    method: 'get',
    params
  })
}

export function batchUserCodeByIdApi(params) {
  return Vue.axios('coupons')({
    url: '/equities/adminCoupon/batchCode',
    method: 'post',
    data: { ...params }
  })
}

export function createCouponTagApi(params) {
  return Vue.axios('coupons')({
    url: '/equities/adminCouponTag/tags',
    method: 'post',
    data: { ...params }
  })
}

export function getCouponTagsApi(params) {
  return Vue.axios('coupons')({
    url: '/equities/adminCouponTag/tags',
    method: 'get',
    params
  })
}

export function updateCouponTagApi(params) {
  return Vue.axios('coupons')({
    url: '/equities/adminCouponTag/tags',
    method: 'put',
    data: { ...params }
  })
}

export function deleteCouponTagApi(params) {
  return Vue.axios('coupons')({
    url: `/equities/adminCouponTag/tags/${params.id}`,
    method: 'delete'
  })
}
