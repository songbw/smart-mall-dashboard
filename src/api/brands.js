import Vue from 'vue'

export function getBrandListApi(params) {
  return Vue.axios.request({
    url: '/v2/products/adminBrand/brandList',
    method: 'get',
    params
  })
}

export function searchBrandsApi(params) {
  return Vue.axios.request({
    url: '/v2/products/adminBrand/search',
    method: 'get',
    params
  })
}
