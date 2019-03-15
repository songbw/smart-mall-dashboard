import request from '@/utils/request'

export function getProductList(params) {
  return request({
    url: '/adminProd/prodList',
    method: 'get',
    params
  })
}

export function searchProductInfo(params) {
  return request({
    url: '/adminProd/search',
    method: 'post',
    data: {
      ...params
    }
  })
}

export function updateProductInfo(params) {
  return request({
    url: '/adminProd/updateProduct',
    method: 'post',
    data: {
      ...params
    }
  })
}
