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

export function getWorkOrderTypesApi(params) {
  return Vue.axios.request({
    url: '/workorders/order_types/pages',
    method: 'get',
    params
  })
}

export function createWorkOrderApi(params) {
  return Vue.axios.request({
    url: '/workorders/order_types',
    method: 'post',
    data: { ...params }
  })
}

export function updateWorkOrderApi(params) {
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
