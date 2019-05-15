import request from '@/utils/request'

export function getCouponsApi(params) {
  return request({
    url: '/coupon/find',
    method: 'get',
    params
  })
}

export function searchCouponsApi(params) {
  return request({
    url: '/coupon/search',
    method: 'post',
    data: { ...params }
  })
}

export function getCouponByIdApi(params) {
  return request({
    url: '/coupon/findById',
    method: 'get',
    params
  })
}

export function createCouponApi(params) {
  return request({
    url: '/coupon/create',
    method: 'post',
    data: { ...params }
  })
}

export function updateCouponApi(params) {
  return request({
    url: '/coupon/update',
    method: 'post',
    data: { ...params }
  })
}

export function deleteCouponApi(params) {
  return request({
    url: '/coupon/delete',
    method: 'delete',
    params
  })
}

export function getCouponUsageByIdApi(params) {
  return request({
    url: '/coupon/usageById',
    method: 'get',
    params
  })
}
