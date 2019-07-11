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
