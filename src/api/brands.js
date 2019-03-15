import request from '@/utils/request'

export function getBrandList(params) {
  return request({
    url: '/adminBrand/brandList',
    method: 'get',
    params
  })
}

export function updateBrandInfo(params) {
  return request({
    url: '/adminBrand/updateBrand',
    method: 'post',
    data: {
      brandId: params.brandId,
      brandLogo: params.brandLogo
    }
  })
}

export function searchBrandInfo(params) {
  return request({
    url: '/adminBrand/search',
    method: 'get',
    params
  })
}
