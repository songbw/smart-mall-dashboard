import request from '@/utils/request'

export function getPromotionsApi(params) {
  return request({
    url: '/promotion/find',
    method: 'get',
    params
  })
}

export function searchPromotionsApi(params) {
  return request({
    url: '/promotion/search',
    method: 'post',
    data: { ...params }
  })
}

export function createPromotionApi(params) {
  return request({
    url: '/promotion/create',
    method: 'post',
    data: { ...params }
  })
}

export function updatePromotionApi(params) {
  return request({
    url: '/promotion/update',
    method: 'post',
    data: { ...params }
  })
}

export function getPromotionByIdApi(params) {
  return request({
    url: '/promotion/findById',
    method: 'get',
    params
  })
}

export function deletePromotionApi(params) {
  return request({
    url: '/promotion/delete',
    method: 'delete',
    params
  })
}

export function addPromotionContentApi(params) {
  return request({
    url: '/promotion/createContent',
    method: 'post',
    data: { ...params }
  })
}

export function updatePromotionContentApi(params) {
  return request({
    url: '/promotion/updateContent',
    method: 'put',
    data: { ...params }
  })
}

export function deletePromotionContentApi(params) {
  return request({
    url: '/promotion/deleteContent',
    method: 'delete',
    data: { ...params }
  })
}
