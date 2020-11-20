import Vue from 'vue'

export function getProductListApi(params) {
  return Vue.axios('products').request({
    url: '/products/adminProd/prodList',
    method: 'get',
    params
  })
}

export function searchProductsApi(params) {
  const { limit, offset, query, ...rest } = params
  const data = {
    pageNo: offset,
    pageSize: limit,
    ...rest
  }
  if (query) data.name = query
  data.sortValue = 'sortValue' in params ? params.sortValue : 'merchant_sort'

  return Vue.axios('products').request({
    url: '/products/adminProd/search/v2',
    method: 'post',
    data
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

export function batchUpdateStateApi(params) {
  return Vue.axios('products').request({
    url: '/products/adminProd/batchState',
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

export function getProductsByMpuListApi(params) {
  return Vue.axios('products').request({
    url: '/products/prod/mpuIds',
    method: 'get',
    params
  })
}

export function getDetailInfoByMpuApi(params) {
  return Vue.axios('products').request({
    url: '/products/adminProd',
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

export function getInventoryBySkuCodesApi(params) {
  return Vue.axios('products').request({
    url: '/aoyis/star/product/inventory',
    method: 'post',
    data: params
  })
}

export function syncProductsApi(params) {
  return Vue.axios('mproducts').request({
    url: '/products/third/prod/sync',
    method: 'post',
    data: params
  })
}

export function createRenterSkuPriceApi(params) {
  return Vue.axios('products').request({
    url: '/products/adminProd/renter',
    method: 'post',
    data: params
  })
}

export function updateRenterSkuPriceApi(params) {
  return Vue.axios('products').request({
    url: '/products/adminProd/renter',
    method: 'put',
    data: params
  })
}

export function deleteRenterSkuPriceApi(params) {
  return Vue.axios('products').request({
    url: '/products/adminProd/renter',
    method: 'delete',
    params
  })
}

export function updateRenterSkuStateApi(params) {
  return Vue.axios('products').request({
    url: '/products/adminProd/renter/state',
    method: 'put',
    data: params
  })
}

export function updateProductStateByMerchant(params) {
  return Vue.axios('products').request({
    url: '/products/adminProd/merchant/state',
    method: 'put',
    data: params
  })
}

export function getHotWordListApi(params) {
  return Vue.axios('products').request({
    url: '/products/es/prod/admin/top',
    method: 'get',
    params
  })
}

export function syncYiyatongProductsApi() {
  return Vue.axios('products').request({
    url: '/products/third/prod/star',
    method: 'get'
  })
}

export function syncYiyatongPriceApi() {
  return Vue.axios('products').request({
    url: '/products/third/prod/star/price',
    method: 'get'
  })
}
