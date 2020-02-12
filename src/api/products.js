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

export function batchUpdateProductsApi(params) {
  return Vue.axios('products').request({
    url: '/products/adminProd/batch',
    method: 'put',
    data: params
  })
}

export function deleteProductApi(params) {
  return Vue.axios('products').request({
    url: `/products/adminProd`,
    method: 'delete',
    params
  })
}

export function getProductsByMpuList(params) {
  return Vue.axios('products').request({
    url: '/products/prod/mpuIds',
    method: 'get',
    params
  })
}

export function getDetailInfoByMpuApi(params) {
  return Vue.axios('products').request({
    url: '/products/prod',
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

export function exportFloorPriceApi(params) {
  return Vue.axios('products').request({
    url: '/products/adminProd/export/price',
    method: 'get',
    responseType: 'arraybuffer',
    params
  })
}

export function updatePriceOrStateApi(params) {
  return Vue.axios('products').request({
    url: '/products/adminProd/price/state',
    method: 'put',
    data: params
  })
}

export function getMerchantCodeListApi() {
  return Vue.axios('products').request({
    url: '/products/merchantCode/all',
    method: 'get'
  })
}

export function getAppPlatformListApi(params) {
  return Vue.axios('products').request({
    url: '/products/platform/all',
    method: 'post',
    data: params
  })
}

export function createAppPlatformApi(params) {
  return Vue.axios('products').request({
    url: '/products/platform',
    method: 'post',
    data: params
  })
}

export function updateAppPlatformApi(params) {
  return Vue.axios('products').request({
    url: '/products/platform',
    method: 'put',
    data: params
  })
}

export function updateSubSkuApi(params) {
  return Vue.axios('products').request({
    url: '/products/adminProd/star/sku',
    method: 'put',
    data: params
  })
}

export function batchUpdateSubSkuApi(params) {
  return Vue.axios('products').request({
    url: '/products/adminProd/batch/star/sku',
    method: 'put',
    data: params
  })
}
