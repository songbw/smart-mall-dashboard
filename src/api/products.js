import Vue from 'vue'

export function getProductListApi(params) {
  return Vue.axios.request({
    url: '/v2/products/adminProd/prodList',
    method: 'get',
    params
  })
}

export function searchProductsApi(params) {
  return Vue.axios.request({
    url: '/v2/products/adminProd/search',
    method: 'post',
    data: {
      ...params
    }
  })
}

export function createProductApi(params) {
  return Vue.axios.request({
    url: '/v2/products/adminProd',
    method: 'post',
    data: {
      ...params
    }
  })
}

export function updateProductApi(params) {
  return Vue.axios.request({
    url: '/v2/products/adminProd',
    method: 'put',
    data: {
      ...params
    }
  })
}
