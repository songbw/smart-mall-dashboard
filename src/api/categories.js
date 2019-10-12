import Vue from 'vue'

export function getAllCategoriesApi() {
  return Vue.axios('mproducts').request({
    url: '/mproducts/adminCategory/all',
    method: 'get'
  })
}

export function getMainCategoriesApi(params) {
  return Vue.axios('mproducts').request({
    url: '/mproducts/adminCategory/oneLevel',
    method: 'get',
    params
  })
}

export function getSubCategoriesApi(params) {
  return Vue.axios('mproducts').request({
    url: '/mproducts/adminCategory/subcategory',
    method: 'get',
    params
  })
}

export function getCategoryInfoApi(params) {
  return Vue.axios('mproducts').request({
    url: '/mproducts/adminCategory/category',
    method: 'get',
    params
  })
}

export function updateCategoryInfoApi(params) {
  return Vue.axios('mproducts').request({
    url: '/mproducts/adminCategory/updateCategory',
    method: 'post',
    data: {
      ...params
    }
  })
}

export function searchCategoryInfoApi(params) {
  return Vue.axios('mproducts').request({
    url: '/mproducts/adminCategory/search',
    method: 'get',
    params
  })
}

export function createCategoryApi(params) {
  return Vue.axios('mproducts').request({
    url: '/mproducts/adminCategory/saveCategory',
    method: 'post',
    data: {
      ...params
    }
  })
}

export function deleteCategoryApi(params) {
  return Vue.axios('mproducts').request({
    url: '/mproducts/adminCategory',
    method: 'delete',
    params
  })
}

export function syncCategoriesApi(params) {
  return Vue.axios('mproducts').request({
    url: '/mproducts/third/prod/category/sync',
    method: 'post',
    data: {
      ...params
    }
  })
}
