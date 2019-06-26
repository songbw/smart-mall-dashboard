import Vue from 'vue'

export function getAggregationsApi(params) {
  return Vue.axios.request({
    url: '/aggregations/adminAggregation/find',
    method: 'get',
    params
  })
}

export function getAggregationByIdApi(params) {
  return Vue.axios.request({
    url: '/aggregations/adminAggregation/findById',
    method: 'get',
    params
  })
}

export function createAggregationApi(params) {
  return Vue.axios.request({
    url: '/aggregations/adminAggregation/create',
    method: 'post',
    data: { ...params }
  })
}

export function updateAggregationApi(params) {
  return Vue.axios.request({
    url: '/aggregations/adminAggregation/update',
    method: 'post',
    data: { ...params }
  })
}

export function searchAggregationsApi(params) {
  return Vue.axios.request({
    url: '/aggregations/adminAggregation/search',
    method: 'post',
    data: { ...params }
  })
}

export function deleteAggregationApi(params) {
  return Vue.axios.request({
    url: '/aggregations/adminAggregation/delete',
    method: 'delete',
    params
  })
}

export function updateAggregationContentApi(params) {
  return Vue.axios.request({
    url: '/aggregations/adminAggregation/updateContent',
    method: 'post',
    data: { ...params }
  })
}

export function getAggregationGroupsApi(params) {
  return Vue.axios.request({
    url: '/aggregations/adminAggregation/findGroup',
    method: 'get',
    params
  })
}

export function createAggregationGroupApi(params) {
  return Vue.axios.request({
    url: '/aggregations/adminAggregation/createGroup',
    method: 'post',
    data: { ...params }
  })
}

export function updateAggregationGroupApi(params) {
  return Vue.axios.request({
    url: '/aggregations/adminAggregation/updateGroup',
    method: 'put',
    data: { ...params }
  })
}

export function deleteAggregationGroupApi(params) {
  return Vue.axios.request({
    url: '/aggregations/adminAggregation/deleteGroup',
    method: 'delete',
    params
  })
}
