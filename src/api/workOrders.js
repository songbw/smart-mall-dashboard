import Vue from 'vue'

export function getWorkOrderListApi(params) {
  return Vue.axios.request({
    url: '/workorders/work_orders/pages',
    method: 'get',
    params
  })
}

export function getWorkOrderByIdApi(params) {
  return Vue.axios.request({
    url: `/workorders/work_orders/${params.id}`,
    method: 'get'
  })
}

export function getWorkOrderTypeListApi(params) {
  return Vue.axios.request({
    url: '/workorders/order_types/pages',
    method: 'get',
    params
  })
}

export function createWorkOrderTypeApi(params) {
  return Vue.axios.request({
    url: '/workorders/order_types',
    method: 'post',
    data: { ...params }
  })
}

export function updateWorkOrderTypeApi(params) {
  return Vue.axios.request({
    url: `/workorders/order_types/${params.id}`,
    method: 'put',
    data: { ...params }
  })
}

export function deleteWorkOrderApi(params) {
  return Vue.axios.request({
    url: `/workorders/order_types/${params.id}`,
    method: 'delete'
  })
}

export function getWorkFlowListApi(params) {
  return Vue.axios.request({
    url: '/workorders/work_flows/pages',
    method: 'get',
    params
  })
}

export function createWorkOrderFlowApi(params) {
  return Vue.axios.request({
    url: '/workorders/work_flows',
    method: 'post',
    data: { ...params }
  })
}
