import Vue from 'vue'

export function getBrandListApi(params) {
  return Vue.axios('mproducts').request({
    url: '/mproducts/adminBrand/brandList',
    method: 'get',
    params
  })
}

export function searchBrandsApi(params) {
  return Vue.axios('mproducts').request({
    url: '/mproducts/adminBrand/search',
    method: 'get',
    params
  })
}

export function updateBrandApi(params) {
  return Vue.axios('mproducts').request({
    url: '/mproducts/adminBrand/updateBrand',
    method: 'post',
    data: {
      ...params
    }
  })
}

export function createBrandApi(params) {
  return Vue.axios('mproducts').request({
    url: '/mproducts/adminBrand',
    method: 'post',
    data: {
      ...params
    }
  })
}

export function deleteBrandApi(params) {
  return Vue.axios('mproducts').request({
    url: '/mproducts/adminBrand',
    method: 'delete',
    params
  })
}

export function syncBrandsApi(params) {
  return Vue.axios('mproducts').request({
    url: '/mproducts/third/prod/brand/sync',
    method: 'post',
    data: {
      ...params
    }
  })
}
