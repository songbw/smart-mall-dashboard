import request from '@/utils/request'

export function getAggregationPagesApi(params) {
  return request({
    url: '/aggregation/find',
    method: 'get',
    params
  })
}

export function getAggregationPageByIdApi(params) {
  return request({
    url: '/aggregation/findById',
    method: 'get',
    params
  })
}

export function createAggregationPageApi(params) {
  return request({
    url: '/aggregation/create',
    method: 'post',
    data: { ...params }
  })
}

export function updateAggregationPageApi(params) {
  return request({
    url: '/aggregation/update',
    method: 'post',
    data: { ...params }
  })
}

export function searchAggregationPagesApi(params) {
  return request({
    url: '/aggregation/search',
    method: 'post',
    data: { ...params }
  })
}

export function deleteAggregationPageApi(params) {
  return request({
    url: '/aggregation/delete',
    method: 'delete',
    params
  })
}

export function updateAggregationPageContentApi(params) {
  return request({
    url: '/aggregation/updateContent',
    method: 'post',
    data: { ...params }
  })
}
