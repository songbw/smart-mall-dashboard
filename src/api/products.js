import Vue from 'vue'

export function getProductListApi(params) {
  return Vue.axios('products').request({
    url: '/products/adminProd/prodList',
    method: 'get',
    params
  })
}

export function searchProductsApi(params) {
  return Vue.axios('products').request({
    url: '/products/adminProd/search',
    method: 'post',
    data: {
      ...params
    }
  })
}

export function createProductApi(params) {
  return Vue.axios('products').request({
    url: '/products/adminProd',
    method: 'post',
    data: {
      ...params
    }
  })
}

export function updateProductApi(params) {
  return Vue.axios('products').request({
    url: '/products/adminProd',
    method: 'put',
    data: {
      ...params
    }
  })
}

export function deleteProductApi(params) {
  return Vue.axios('products').request({
    url: `/products/adminProd`,
    method: 'delete',
    params
  })
}

export function getProductsByIdList(params) {
  return Vue.axios('products').request({
    url: '/products/prod/findByMpuIdList',
    method: 'get',
    params
  })
}

export function exportProductsApi(params) {
  return Vue.axios('products').request({
    url: '/products/adminProd/export',
    method: 'get',
    responseType: 'arraybuffer',
    params
  })
}
