import Vue from 'vue'

export function getProfileApi() {
  return Vue.axios('vendor').request({
    url: '/vendors/companies/profile',
    method: 'get'
  })
}

export function createProfileApi(data) {
  return Vue.axios('vendor').request({
    url: '/vendors/companies/profile',
    method: 'post',
    data
  })
}

export function updateProfileApi(data) {
  return Vue.axios('vendor').request({
    url: '/vendors/companies/profile',
    method: 'put',
    data
  })
}

export function submitProfileApi(data) {
  return Vue.axios('vendor').request({
    url: '/vendors/companies/status',
    method: 'put'
  })
}

export function getVendorListApi(params) {
  return Vue.axios('vendor').request({
    url: '/vendors/companies/list',
    method: 'get',
    params
  })
}

export function reviewVendorProfileApi(params) {
  const data = {
    status: params.status,
    comments: params.comments
  }
  return Vue.axios('vendor').request({
    url: `/vendors/companies/${params.id}/status`,
    method: 'put',
    data
  })
}

export function deleteVendorApi(params) {
  return Vue.axios('vendor').request({
    url: `/vendors/companies/${params.id}`,
    method: 'delete'
  })
}

export function getVendorUserListApi(params) {
  return Vue.axios('vendor').request({
    url: '/vendors/users/list',
    method: 'get',
    params
  })
}

export function setUserVendorApi(params) {
  return Vue.axios('vendor').request({
    url: `/vendors/users/company`,
    method: 'put',
    data: {
      ...params
    }
  })
}

export function getVendorProfileApi(params) {
  return Vue.axios('vendor').request({
    url: `/vendors/vendors/${params.id}`,
    method: 'get'
  })
}
