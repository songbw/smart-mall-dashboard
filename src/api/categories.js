import request from '@/utils/request'

export function getMainCategories(params) {
  return request({
    url: '/adminCategory/oneLevel',
    method: 'get',
    params
  })
}

export function getSubCategories(params) {
  return request({
    url: '/adminCategory/subcategory',
    method: 'get',
    params
  })
}

export function getCategoryInfo(params) {
  return request({
    url: '/adminCategory/category',
    method: 'get',
    params
  })
}

export function updateCategoryInfo(params) {
  return request({
    url: '/adminCategory/updateCategory',
    method: 'post',
    data: {
      categoryId: params.categoryId,
      categoryIcon: params.categoryIcon
    }
  })
}

export function searchCategoryInfo(params) {
  return request({
    url: '/adminCategory/search',
    method: 'get',
    params
  })
}
