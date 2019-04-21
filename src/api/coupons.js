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
