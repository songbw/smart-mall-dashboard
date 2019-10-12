import Vue from 'vue'

export function getProductListApi(params) {
  return Vue.axios('mproducts').request({
    url: '/mproducts/adminProd/prodList',
    method: 'get',
    params
  })
}

export function searchProductsApi(params) {
  return Vue.axios('mproducts').request({
    url: '/mproducts/adminProd/search',
    method: 'post',
    data: {
      ...params
    }
  })
}

export function createProductApi(params) {
  return Vue.axios('mproducts').request({
    url: '/mproducts/adminProd',
    method: 'post',
    data: {
      ...params
    }
  })
}

export function updateProductApi(params) {
  return Vue.axios('mproducts').request({
    url: '/mproducts/adminProd',
    method: 'put',
    data: {
      ...params
    }
  })
}

export function deleteProductApi(params) {
  return Vue.axios('mproducts').request({
    url: `/mproducts/adminProd`,
    method: 'delete',
    params
  })
}

export function getProductsByIdList(params) {
  return Vue.axios('mproducts').request({
    url: '/mproducts/prod/findByMpuIdList',
    method: 'get',
    params
  })
}

export function exportProductsApi(params) {
  return Vue.axios('mproducts').request({
    url: '/mproducts/adminProd/export',
    method: 'get',
    responseType: 'arraybuffer',
    params
  })
}

export function syncProductsApi(params) {
  return Vue.axios('mproducts').request({
    url: '/mproducts/third/prod/sync',
    method: 'post',
    data: {
      ...params
    }
  })
}
