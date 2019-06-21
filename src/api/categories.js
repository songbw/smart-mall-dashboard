import Vue from 'vue'

export function getMainCategoriesApi(params) {
  return Vue.axios.request({
    url: '/v2/products/adminCategory/oneLevel',
    method: 'get',
    params
  })
}

export function getSubCategoriesApi(params) {
  return Vue.axios.request({
    url: '/v2/products/adminCategory/subcategory',
    method: 'get',
    params
  })
}

export function getCategoryInfoApi(params) {
  return Vue.axios.request({
    url: '/v2/products/adminCategory/category',
    method: 'get',
    params
  })
}

export function updateCategoryInfoApi(params) {
  return Vue.axios.request({
    url: '/v2/products/adminCategory/updateCategory',
    method: 'post',
    data: {
      categoryId: params.categoryId,
      categoryIcon: params.categoryIcon
    }
  })
}

export function searchCategoryInfoApi(params) {
  return Vue.axios.request({
    url: '/v2/products/adminCategory/search',
    method: 'get',
    params
  })
}
