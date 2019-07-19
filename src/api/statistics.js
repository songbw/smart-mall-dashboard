import Vue from 'vue'

export function getSummaryDataApi() {
  return Vue.axios('statistics').request({
    url: '/statistics/overview/sum',
    method: 'get'
  })
}

export function getPromotionDataApi(params) {
  return Vue.axios('statistics').request({
    url: '/statistics/overview/promotion/list',
    method: 'get',
    params
  })
}

export function getMerchantDataApi(params) {
  return Vue.axios('statistics').request({
    url: '/statistics/overview/merchant/sum',
    method: 'get',
    params
  })
}

export function getPeriodDataApi(params) {
  return Vue.axios('statistics').request({
    url: '/statistics/overview/period/list',
    method: 'get',
    params
  })
}
