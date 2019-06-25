import Vue from 'vue'

export function getBrandListApi(params) {
  return Vue.axios.request({
    url: '/products/adminBrand/brandList',
    method: 'get',
    params
  })
}

export function searchBrandsApi(params) {
  return Vue.axios.request({
    url: '/products/adminBrand/search',
    method: 'get',
    params
  })
}

export function updateBrandApi(params) {
  return Vue.axios.request({
    url: '/products/adminBrand/updateBrand',
    method: 'post',
    data: {
      ...params
    }
  })
}
