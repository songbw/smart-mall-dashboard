import Vue from 'vue'

export function getWorkOrderListApi(params) {
  return Vue.axios('work_orders').request({
    url: '/workorders/work_orders/pages',
    method: 'get',
    params
  })
}

export function getWorkOrderByIdApi(params) {
  return Vue.axios('work_orders').request({
    url: `/workorders/work_orders/${params.id}`,
    method: 'get'
  })
}

export function getWorkFlowListApi(params) {
  return Vue.axios('work_orders').request({
    url: '/workorders/work_flows/pages',
    method: 'get',
    params
  })
}

export function createWorkOrderFlowApi(params) {
  return Vue.axios('work_orders').request({
    url: '/workorders/work_flows',
    method: 'post',
    data: { ...params }
  })
}

export function reopenWorkOrderFlowApi(params) {
  return Vue.axios('work_orders').request({
    url: '/workorders/work_flows/work_order',
    method: 'post',
    data: { ...params }
  })
}

export function getReturnAddressListApi(params) {
  return Vue.axios('work_orders').request({
    url: '/workorders/addresses/list',
    method: 'get',
    params
  })
}

export function getDefaultReturnAddressApi(params) {
  return Vue.axios('work_orders').request({
    url: '/workorders/addresses/default',
    method: 'get'
  })
}

export function createReturnAddressApi(params) {
  return Vue.axios('work_orders').request({
    url: '/workorders/addresses',
    method: 'post',
    data: { ...params }
  })
}

export function getReturnAddressByIdApi(params) {
  return Vue.axios('work_orders').request({
    url: `/workorders/addresses/${params.id}`,
    method: 'get'
  })
}

export function updateReturnAddressApi(params) {
  const { id, ...content } = params
  return Vue.axios('work_orders').request({
    url: `/workorders/addresses/${id}`,
    method: 'put',
    data: { ...content }
  })
}

export function deleteReturnAddressApi(params) {
  const { id } = params
  return Vue.axios('work_orders').request({
    url: `/workorders/addresses/${id}`,
    method: 'delete'
  })
}

export function getWorkOrderByOrderListApi(params) {
  return Vue.axios('work_orders').request({
    url: '/workorders/work_orders/byOrderList',
    method: 'post',
    data: params
  })
}
