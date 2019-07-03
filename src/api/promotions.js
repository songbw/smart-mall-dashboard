import Vue from 'vue'

export function getPromotionsApi(params) {
  return Vue.axios.request({
    url: '/equities/adminPromotion/find',
    method: 'get',
    params
  })
}

export function searchPromotionsApi(params) {
  return Vue.axios.request({
    url: '/equities/adminPromotion/search',
    method: 'post',
    data: { ...params }
  })
}

export function createPromotionApi(params) {
  return Vue.axios.request({
    url: '/equities/adminPromotion/create',
    method: 'post',
    data: { ...params }
  })
}

export function updatePromotionApi(params) {
  return Vue.axios.request({
    url: '/equities/adminPromotion/update',
    method: 'post',
    data: { ...params }
  })
}

export function getPromotionByIdApi(params) {
  return Vue.axios.request({
    url: '/equities/adminPromotion/findById',
    method: 'get',
    params
  })
}

export function deletePromotionApi(params) {
  return Vue.axios.request({
    url: '/equities/adminPromotion/delete',
    method: 'delete',
    params
  })
}

export function addPromotionContentApi(params) {
  return Vue.axios.request({
    url: '/equities/adminPromotion/createContent',
    method: 'post',
    data: { ...params }
  })
}

export function updatePromotionContentApi(params) {
  return Vue.axios.request({
    url: '/equities/adminPromotion/updateContent',
    method: 'put',
    data: { ...params }
  })
}

export function deletePromotionContentApi(params) {
  return Vue.axios.request({
    url: '/equities/adminPromotion/deleteContent',
    method: 'delete',
    data: { ...params }
  })
}