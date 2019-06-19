import Vue from 'vue'

export function getProfileApi() {
  return Vue.axios.request({
    url: '/vendors/v1/companies/profile',
    method: 'get'
  })
}

export function createProfileApi(data) {
  return Vue.axios.request({
    url: '/vendors/v1/companies/profile',
    method: 'post',
    data
  })
}

export function updateProfileApi(data) {
  return Vue.axios.request({
    url: '/vendors/v1/companies/profile',
    method: 'put',
    data
  })
}

export function submitProfileApi(data) {
  return Vue.axios.request({
    url: '/vendors/v1/companies/status',
    method: 'put'
  })
}

export function getVendorListApi(params) {
  return Vue.axios.request({
    url: '/vendors/v1/companies/list',
    method: 'get',
    params
  })
}

export function reviewVendorProfileApi(params) {
  const data = {
    status: params.status,
    comments: params.comments
  }
  return Vue.axios.request({
    url: `/vendors/v1/companies/${params.id}/status`,
    method: 'put',
    data
  })
}
