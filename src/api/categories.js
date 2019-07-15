import Vue from 'vue'

export function getAllCategoriesApi() {
  return Vue.axios('categories').request({
    url: '/products/adminCategory/all',
    method: 'get'
  })
}

export function getMainCategoriesApi(params) {
  return Vue.axios('categories').request({
    url: '/products/adminCategory/oneLevel',
    method: 'get',
    params
  })
}

export function getSubCategoriesApi(params) {
  return Vue.axios('categories').request({
    url: '/products/adminCategory/subcategory',
    method: 'get',
    params
  })
}

export function getCategoryInfoApi(params) {
  return Vue.axios('categories').request({
    url: '/products/adminCategory/category',
    method: 'get',
    params
  })
}

export function updateCategoryInfoApi(params) {
  return Vue.axios('categories').request({
    url: '/products/adminCategory/updateCategory',
    method: 'post',
    data: {
      ...params
    }
  })
}

export function searchCategoryInfoApi(params) {
  return Vue.axios('categories').request({
    url: '/products/adminCategory/search',
    method: 'get',
    params
  })
}

export function createCategoryApi(params) {
  return Vue.axios('categories').request({
    url: '/products/adminCategory/saveCategory',
    method: 'post',
    data: {
      ...params
    }
  })
}

export function deleteCategoryApi(params) {
  return Vue.axios('categories').request({
    url: '/products/adminCategory',
    method: 'delete',
    params
  })
}
