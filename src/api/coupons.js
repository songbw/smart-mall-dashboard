import request from '@/utils/request'

export function getCouponsApi(params) {
  return request({
    url: '/adminCoupon/find',
    method: 'get',
    params
  })
}

export function searchCouponsApi(params) {
  return request({
    url: '/adminCoupon/search',
    method: 'post',
    data: { ...params }
  })
}

export function getCouponByIdApi(params) {
  return request({
    url: '/adminCoupon/findById',
    method: 'get',
    params
  })
}

export function createCouponApi(params) {
  return request({
    url: '/adminCoupon/create',
    method: 'post',
    data: { ...params }
  })
}

export function updateCouponApi(params) {
  return request({
    url: '/adminCoupon/update',
    method: 'post',
    data: { ...params }
  })
}

export function deleteCouponApi(params) {
  return request({
    url: '/adminCoupon/delete',
    method: 'delete',
    params
  })
}

export function getCouponUsageByIdApi(params) {
  return request({
    url: '/adminCoupon/usageById',
    method: 'get',
    params
  })
}

export function batchUserCodeByIdApi(params) {
  return request({
    url: '/adminCoupon/batchCode',
    method: 'post',
    data: { ...params }
  })
}

export function createCouponTagApi(params) {
  return request({
    url: '/adminCouponTag/tags',
    method: 'post',
    data: { ...params }
  })
}

export function getCouponTagsApi(params) {
  return request({
    url: '/adminCouponTag/tags',
    method: 'get',
    params
  })
}

export function updateCouponTagApi(params) {
  return request({
    url: '/adminCouponTag/tags',
    method: 'put',
    data: { ...params }
  })
}

export function deleteCouponTagApi(params) {
  return request({
    url: `/adminCouponTag/tags/${params.id}`,
    method: 'delete'
  })
}
